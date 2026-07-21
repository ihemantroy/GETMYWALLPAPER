-- ============================================================================
--  GetYourWallpaper.com — Supabase schema
--  Run in: Supabase Dashboard → SQL Editor → New query → Run.
--  Storage: wallpaper image files live in the `wallpapers` Storage bucket.
--  Database: all metadata (below) lives in Postgres.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Profiles (1:1 with auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique,
  display_name text,
  avatar_url   text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Wallpapers ──────────────────────────────────────────────────────────────
create table if not exists public.wallpapers (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  description    text,
  storage_path   text not null,
  width          int not null default 0,
  height         int not null default 0,
  file_size      bigint not null default 0,
  blurhash       text,
  dominant_color text,
  palette        text[],
  orientation    text not null default 'landscape',
  device         text not null default 'desktop',
  category       text,
  tags           text[] default '{}',
  status         text not null default 'pending',   -- draft|scheduled|pending|published|rejected
  is_featured    boolean not null default false,    -- Wallpaper of the Day
  is_community   boolean not null default false,    -- arrived via Contribute
  view_count     int not null default 0,
  download_count int not null default 0,
  like_count     int not null default 0,
  uploader_id    uuid references auth.users(id) on delete set null,
  published_at   timestamptz,
  scheduled_for  timestamptz,
  created_at     timestamptz not null default now(),
  search_vector  tsvector
);

create index if not exists wallpapers_status_idx     on public.wallpapers (status, published_at desc);
create index if not exists wallpapers_device_idx     on public.wallpapers (device);
create index if not exists wallpapers_tags_idx       on public.wallpapers using gin (tags);
create index if not exists wallpapers_search_idx     on public.wallpapers using gin (search_vector);

-- Keep the search vector in sync with title/description/tags.
create or replace function public.wallpapers_search_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags, ' '), '')), 'C');
  return new;
end; $$;

drop trigger if exists wallpapers_search_trg on public.wallpapers;
create trigger wallpapers_search_trg
  before insert or update on public.wallpapers
  for each row execute function public.wallpapers_search_update();

-- ── Collections & favourites ────────────────────────────────────────────────
create table if not exists public.collections (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  title               text not null,
  description         text,
  cover_wallpaper_id  uuid references public.wallpapers(id) on delete set null,
  is_public           boolean not null default true,
  owner_id            uuid references auth.users(id) on delete cascade,
  created_at          timestamptz not null default now()
);

create table if not exists public.collection_items (
  collection_id uuid references public.collections(id) on delete cascade,
  wallpaper_id  uuid references public.wallpapers(id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (collection_id, wallpaper_id)
);

create table if not exists public.favorites (
  user_id      uuid references auth.users(id) on delete cascade,
  wallpaper_id uuid references public.wallpapers(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, wallpaper_id)
);

-- ── Atomic counters (avoid read-modify-write races) ─────────────────────────
create or replace function public.increment_counter(row_id uuid, col text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if col not in ('view_count','download_count','like_count') then
    raise exception 'invalid column';
  end if;
  execute format('update public.wallpapers set %I = %I + 1 where id = $1', col, col)
  using row_id;
end; $$;

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.wallpapers      enable row level security;
alter table public.collections     enable row level security;
alter table public.collection_items enable row level security;
alter table public.favorites       enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- profiles
drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles for select using (true);
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- wallpapers: everyone reads published; admins read/write all; users insert own community submissions
drop policy if exists "published readable" on public.wallpapers;
create policy "published readable" on public.wallpapers
  for select using (status = 'published' or is_admin() or uploader_id = auth.uid());
drop policy if exists "contribute insert" on public.wallpapers;
create policy "contribute insert" on public.wallpapers
  for insert with check (auth.uid() = uploader_id and status = 'pending');
drop policy if exists "admin write" on public.wallpapers;
create policy "admin write" on public.wallpapers
  for update using (is_admin());
drop policy if exists "admin delete" on public.wallpapers;
create policy "admin delete" on public.wallpapers
  for delete using (is_admin());

-- favorites: users manage their own
drop policy if exists "own favorites" on public.favorites;
create policy "own favorites" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- collections: public read, owner writes
drop policy if exists "public collections read" on public.collections;
create policy "public collections read" on public.collections
  for select using (is_public or owner_id = auth.uid() or is_admin());
drop policy if exists "owner collections write" on public.collections;
create policy "owner collections write" on public.collections
  for all using (owner_id = auth.uid() or is_admin()) with check (owner_id = auth.uid() or is_admin());
drop policy if exists "collection items read" on public.collection_items;
create policy "collection items read" on public.collection_items for select using (true);

-- ── Storage bucket for wallpaper files ──────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('wallpapers', 'wallpapers', true)
on conflict (id) do nothing;

drop policy if exists "wallpaper files public read" on storage.objects;
create policy "wallpaper files public read" on storage.objects
  for select using (bucket_id = 'wallpapers');

drop policy if exists "authed upload wallpapers" on storage.objects;
create policy "authed upload wallpapers" on storage.objects
  for insert to authenticated with check (bucket_id = 'wallpapers');

drop policy if exists "admin manage wallpaper files" on storage.objects;
create policy "admin manage wallpaper files" on storage.objects
  for delete using (bucket_id = 'wallpapers' and public.is_admin());

-- ============================================================================
--  Done. Set your own account admin after first sign-in:
--    update public.profiles set is_admin = true where id =
--      (select id from auth.users where email = 'you@example.com');
-- ============================================================================
