-- ============================================================================
--  GetYourWallpaper — daily "vibe" push notifications
--  Run in Supabase → SQL Editor after the other migrations.
-- ============================================================================
create table if not exists public.push_subscriptions (
  endpoint   text primary key,
  p256dh     text not null,
  auth       text not null,
  vibe       text,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
-- No public policies: only the server (service role) reads/writes these.
