-- Homepage testimonials: managed from /admin/testimonials
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  text text not null,
  role text,
  rating int not null default 5 check (rating between 1 and 5),
  sort_order int not null default 0,
  created_at timestamptz default now()
);

alter table testimonials enable row level security;

drop policy if exists "public read testimonials" on testimonials;
create policy "public read testimonials" on testimonials for select using (true);

-- seed a starter set (safe to run once; skips if any rows already exist)
insert into testimonials (name, text, role, rating, sort_order)
select * from (values
  ('Pritam', 'Every wallpaper just fits — no cropping, no stretching. My home screen finally looks premium.', 'Phone', 5, 1),
  ('Aman', 'Grabbed a 4K one for my laptop and it looks unreal. The quality here is on another level.', 'Desktop', 5, 2),
  ('Shubham', 'Clean, fast, and free. One-tap download at my exact resolution is genius.', 'Phone', 5, 3)
) as seed(name, text, role, rating, sort_order)
where not exists (select 1 from testimonials);
