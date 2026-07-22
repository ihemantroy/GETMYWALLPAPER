-- ============================================================================
--  GetYourWallpaper — Wallpaper of the Day
--  Run in Supabase → SQL Editor after the other migrations.
-- ============================================================================
alter table public.wallpapers
  add column if not exists is_wotd boolean not null default false;

-- only one "wallpaper of the day" at a time
create unique index if not exists wallpapers_one_wotd
  on public.wallpapers ((true)) where is_wotd;
