-- Homepage hero: choose a wallpaper + crop focus per device (phone/tablet/desktop)
create table if not exists homepage_hero (
  device text primary key check (device in ('phone','tablet','desktop')),
  wallpaper_id uuid references wallpapers(id) on delete set null,
  focus text not null default 'center' check (focus in ('top','center','bottom')),
  updated_at timestamptz default now()
);

alter table homepage_hero enable row level security;

-- everyone can read (the homepage needs it); writes happen via the admin service role
drop policy if exists "public read hero" on homepage_hero;
create policy "public read hero" on homepage_hero for select using (true);
