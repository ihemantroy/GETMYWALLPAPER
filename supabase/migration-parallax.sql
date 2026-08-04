-- 3D Parallax collection
-- Marks hand-picked wallpapers that look great as live 3D parallax wallpapers
-- in the Android app. Only these show up in the app's "3D Parallax" section.

alter table public.wallpapers
  add column if not exists is_parallax boolean not null default false;

-- Fast lookups for the small parallax set.
create index if not exists wallpapers_is_parallax_idx
  on public.wallpapers (is_parallax)
  where is_parallax = true;

-- How to mark a wallpaper as 3D parallax:
--   Supabase Dashboard → Table editor → wallpapers → edit a row →
--   set is_parallax = true. (Do this for your custom-uploaded 3D ones.)
--
-- Or in SQL, e.g.:
--   update public.wallpapers set is_parallax = true where slug = 'your-slug';
