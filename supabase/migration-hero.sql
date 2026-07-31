-- Homepage hero: choose a wallpaper + crop focus + fit per device (phone/tablet/desktop)
create table if not exists homepage_hero (
  device text primary key check (device in ('phone','tablet','desktop')),
  wallpaper_id uuid references wallpapers(id) on delete set null,
  focus text not null default 'center' check (focus in ('top','center','bottom')),
  fit text not null default 'cover' check (fit in ('cover','contain')),
  updated_at timestamptz default now()
);

-- if the table already existed without the fit column, add it
alter table homepage_hero add column if not exists fit text not null default 'cover';

alter table homepage_hero enable row level security;

drop policy if exists "public read hero" on homepage_hero;
create policy "public read hero" on homepage_hero for select using (true);
