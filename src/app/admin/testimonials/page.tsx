import { createAdminClient } from "@/lib/supabase/server";
import { TestimonialManager } from "./manager";
import type { Testimonial } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminTestimonials() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("testimonials")
    .select("id, name, text, role, rating")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const missing = Boolean(error);
  const items = (data ?? []) as Testimonial[];

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Testimonials</h1>
      <p className="mt-1 text-sm text-chalk-muted">
        These show in the &ldquo;What people say&rdquo; strip on the homepage. Add as many as you like — they
        scroll in a loop. While this list is empty, a default set (Pritam, Aman, Shubham&hellip;) shows automatically.
      </p>

      {missing && (
        <div className="mt-5 rounded-card border border-accent-2/30 bg-accent-2/10 px-4 py-3 text-sm text-chalk">
          Run <code className="rounded bg-white/10 px-1.5 py-0.5">supabase/migration-testimonials.sql</code> in
          Supabase first to create the table, then reload this page.
        </div>
      )}

      <TestimonialManager items={items} />
    </div>
  );
}
