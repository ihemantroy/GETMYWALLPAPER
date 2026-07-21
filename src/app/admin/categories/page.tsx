import { createAdminClient } from "@/lib/supabase/server";
import { CategoryManager } from "@/app/admin/categories/manager";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("category_counts")
    .select("*")
    .order("sort_order", { ascending: true });
  const categories = (data ?? []) as Category[];

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Categories</h1>
      <p className="mt-1 text-sm text-chalk-muted">
        Group wallpapers so they show up in the browse sidebar. Assign a category when you upload.
      </p>
      <CategoryManager categories={categories} />
    </div>
  );
}
