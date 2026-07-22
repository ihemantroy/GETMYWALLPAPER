-- ============================================================================
--  GetYourWallpaper — creator credit
--  Run in Supabase → SQL Editor after the other migrations.
-- ============================================================================
alter table public.wallpapers
  add column if not exists credit text,
  add column if not exists credit_url text;
