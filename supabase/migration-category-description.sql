-- ============================================================================
--  GetYourWallpaper — Category descriptions
--  Run this in Supabase → SQL Editor AFTER migration-categories.sql.
--  Adds a writable "description" field so each category's intro copy on
--  /wallpapers/[slug] can be written from the admin panel instead of code.
-- ============================================================================

alter table public.categories
  add column if not exists description text;

-- Drop and recreate rather than CREATE OR REPLACE — Postgres won't allow
-- REPLACE to insert a column in the middle of an existing view's column list.
drop view if exists public.category_counts;

create view public.category_counts as
  select c.id, c.slug, c.name, c.description, c.sort_order,
         count(w.id) filter (where w.status = 'published') as count
  from public.categories c
  left join public.wallpapers w on w.category_id = c.id
  group by c.id, c.slug, c.name, c.description, c.sort_order;

grant select on public.category_counts to anon, authenticated;
