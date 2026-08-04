-- ============================================================================
--  GetYourWallpaper — 3D Parallax app waitlist
--  Run in Supabase → SQL Editor after the other migrations.
--  The displayed number on the site is BASE (1000) + the rows in this table,
--  so the counter is real and shared across every visitor.
-- ============================================================================
create table if not exists public.waitlist (
  browser_id text primary key,          -- anonymous per-browser id (dedupes joins)
  email      text,                       -- optional: captured if the user opts in
  created_at timestamptz not null default now()
);

create index if not exists waitlist_created_idx on public.waitlist (created_at);

alter table public.waitlist enable row level security;
-- No public policies on purpose: only the server (service role) reads/writes this
-- table, via /api/waitlist. That keeps emails private and the count tamper-safe.
