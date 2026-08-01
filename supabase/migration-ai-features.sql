-- AI features migration: semantic search + find-similar (pgvector embeddings),
-- AI-written alt text, and a rate-limit log for the free AI image generator.
-- Safe to run multiple times.

-- 1. pgvector extension (Supabase projects have this available by default)
create extension if not exists vector;

-- 2. Embedding column. 1024-dim to match Jina's jina-clip-v2 model, which
--    embeds BOTH text and images into the same space — one column powers
--    both semantic search (feature 3) and find-similar (feature 4).
alter table public.wallpapers add column if not exists embedding vector(1024);

-- AI-written accessible alt text (feature 2), kept separate from the
-- longer marketing `description` field.
alter table public.wallpapers add column if not exists alt_text text;

-- Approximate nearest-neighbour index for fast cosine similarity search.
-- ivfflat needs some rows to train on; if this errors on a brand-new/empty
-- table, just re-run the migration after you have a few dozen wallpapers.
do $$
begin
  if not exists (select 1 from pg_indexes where indexname = 'wallpapers_embedding_idx') then
    create index wallpapers_embedding_idx
      on public.wallpapers using ivfflat (embedding vector_cosine_ops) with (lists = 100);
  end if;
exception when others then
  raise notice 'Skipping ivfflat index for now (not enough rows yet) — safe to ignore.';
end $$;

-- 3. RPC: nearest-neighbour search over published wallpapers.
--    Used for both "semantic search" (query_embedding = embedded search text)
--    and "find similar" (query_embedding = an existing wallpaper's embedding).
create or replace function match_wallpapers(
  query_embedding vector(1024),
  match_count int default 24,
  exclude_id uuid default null
)
returns table (id uuid, similarity float)
language sql stable
as $$
  select id, 1 - (embedding <=> query_embedding) as similarity
  from public.wallpapers
  where status = 'published'
    and embedding is not null
    and (exclude_id is null or id <> exclude_id)
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- 4. Rate-limit log for the free text→image generator (feature 1), so a
--    single visitor can't hammer the free image API. One row per generation.
create table if not exists public.generation_log (
  id bigint generated always as identity primary key,
  client_key text not null,
  created_at timestamptz not null default now()
);
create index if not exists generation_log_client_idx on public.generation_log (client_key, created_at);

-- Housekeeping: nothing before this line depends on RLS, but generation_log
-- is only ever touched by the service-role client (server-side), so RLS
-- stays off for it — mirrors how the rest of this project's admin tables work.
