-- ============================================================================
--  GetYourWallpaper — Categories add-on
--  Run this in Supabase → SQL Editor AFTER schema.sql (safe to re-run).
-- ============================================================================

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

alter table public.wallpapers
  add column if not exists category_id uuid references public.categories(id) on delete set null;

create index if not exists wallpapers_category_id_idx on public.wallpapers(category_id);

-- Live published-count per category (fast sidebar counts, readable by anon).
create or replace view public.category_counts as
  select c.id, c.slug, c.name, c.sort_order,
         count(w.id) filter (where w.status = 'published') as count
  from public.categories c
  left join public.wallpapers w on w.category_id = c.id
  group by c.id, c.slug, c.name, c.sort_order;

grant select on public.category_counts to anon, authenticated;

alter table public.categories enable row level security;

drop policy if exists "categories readable" on public.categories;
create policy "categories readable" on public.categories for select using (true);

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Starter categories — edit or delete these in the admin panel anytime.
insert into public.categories (slug, name, sort_order) values
  ('minimal',  'Minimal',  1),
  ('abstract', 'Abstract', 2),
  ('nature',   'Nature',   3),
  ('anime',    'Anime',    4),
  ('space',    'Space',    5)
on conflict (slug) do nothing;
