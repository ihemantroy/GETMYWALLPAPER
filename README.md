# GetYourWallpaper.com

A minimal, category-driven wallpaper platform. Clean dark UI, one confident accent, a category rail with live counts, and an admin panel with **bulk upload straight into a category**.

Built with **Next.js 15 · React 19 · TypeScript · Tailwind · Framer Motion · Supabase**. Deploys to **Vercel** in a few clicks.

---

## What's inside

- **Browse everything on one page** — category rail (with live counts) on the left, search + device/sort/favorites filters up top, buttery masonry grid. No clutter.
- **Categories** — create them in the admin panel; assign wallpapers on upload; they show up instantly in the browse sidebar with counts.
- **Featured rail** — flag any wallpaper to feature it on the homepage.
- **Wallpaper page** — live device preview (phone / desktop / tablet), resolution picker, one-tap download, related wallpapers, JSON-LD.
- **Submit** — signed-in users upload -> review queue -> auto-publishes on approval, with a category attached.
- **Admin** — dashboard, single + **bulk upload under a category** (with scheduling + feature toggle), moderation queue, catalog management, category manager.
- **Auth** — Supabase magic-link + Google OAuth.
- **Monetization** — AdSense slots that render only when configured, lazy-loaded.
- **SEO & speed** — dynamic metadata, sitemap (categories + every wallpaper), robots, manifest, Server Components + ISR, next/image AVIF/WebP, blurhash placeholders.

**No placeholder wallpapers ship with this repo.** The catalog is empty until you upload your own — every page has a proper empty state.

---

## 1. Set up Supabase (run BOTH SQL files)

1. Create a project at supabase.com.
2. Open **SQL Editor -> New query**, paste `supabase/schema.sql`, **Run**.
3. New query again, paste `supabase/migration-categories.sql`, **Run**. (Adds the categories table + counts, seeds a few starter categories you can edit or delete in the admin panel.)

**Where things live:** image files -> the `wallpapers` Storage bucket; all metadata (title, tags, category, counts, status) -> Postgres.

## 2. Configure environment

    cp .env.example .env.local

Fill from **Supabase -> Project Settings -> API** (new keys: Publishable = anon, Secret = service_role):

| Variable | Value |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Publishable / anon key |
| SUPABASE_SERVICE_ROLE_KEY | Secret / service_role key (server-only) |
| ADMIN_EMAILS | your email -> unlocks /admin |
| NEXT_PUBLIC_SITE_URL | http://localhost:3000 locally |
| NEXT_PUBLIC_ADSENSE_CLIENT | optional; ads only render when set |

## 3. Run locally

    npm install
    npm run dev

Open http://localhost:3000. Sign in with your admin email, then make yourself admin:

    update public.profiles set is_admin = true
    where id = (select id from auth.users where email = 'you@example.com');

Now open **Categories** in the admin panel to add a few, then **Upload** to drop a batch straight into one.

## 4. Deploy to Vercel via GitHub

1. Push to a GitHub repo.
2. Import it at vercel.com/new.
3. Add the same env vars (set NEXT_PUBLIC_SITE_URL to your production domain).
4. Deploy. In Supabase -> Authentication -> URL Configuration, add your Vercel URL so login works in production.

---

## Reskin in one place

The whole look keys off one accent. In `src/app/globals.css`:

    :root { --accent: #7C5CFF; --accent-2: #C74BFF; }

Change those two and the logo, buttons, active states, and glows all follow.

## Notes

- **Scheduled drops** are stored with status = 'scheduled'; add a Vercel Cron or Supabase scheduled function to flip them to published at their time.
- **AI auto-tagging** — the data model has the fields; drop your provider into the upload action to pre-fill tags before publish.
