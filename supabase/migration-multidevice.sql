-- ============================================================================
--  GetYourWallpaper — multi-device support
--  Run in Supabase → SQL Editor AFTER schema.sql + migration-categories.sql.
--  Lets one wallpaper be tagged for several devices (phone, tablet, desktop).
-- ============================================================================

alter table public.wallpapers
  add column if not exists devices text[] not null default '{}';

-- backfill from the existing single `device` column
update public.wallpapers
  set devices = array[device]
  where (devices is null or devices = '{}') and device is not null;

create index if not exists wallpapers_devices_idx on public.wallpapers using gin (devices);
