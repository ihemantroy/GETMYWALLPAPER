"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

async function assertAdmin() {
  if (!(await isAdmin())) throw new Error("Not authorized");
}

/** Admin single/bulk upload: files already in Storage → create published/scheduled rows. */
export async function createWallpaper(input: {
  title: string;
  storage_path: string;
  width: number;
  height: number;
  file_size: number;
  device: string;
  tags: string[];
  category_id?: string | null;
  description?: string;
  scheduled_for?: string | null;
  is_featured?: boolean;
}) {
  await assertAdmin();
  const admin = createAdminClient();
  const scheduled = input.scheduled_for && new Date(input.scheduled_for) > new Date();
  const { error } = await admin.from("wallpapers").insert({
    slug: `${slugify(input.title)}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`,
    title: input.title,
    description: input.description ?? null,
    storage_path: input.storage_path,
    width: input.width,
    height: input.height,
    file_size: input.file_size,
    orientation: input.width >= input.height ? "landscape" : "portrait",
    device: input.device,
    category_id: input.category_id ?? null,
    tags: input.tags,
    is_featured: input.is_featured ?? false,
    status: scheduled ? "scheduled" : "published",
    scheduled_for: scheduled ? input.scheduled_for : null,
    published_at: scheduled ? null : new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function approveWallpaper(id: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("wallpapers")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/queue");
  revalidatePath("/");
}

export async function rejectWallpaper(id: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("wallpapers").update({ status: "rejected" }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/queue");
}

export async function deleteWallpaper(id: string, storage_path: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.storage.from("wallpapers").remove([storage_path]).catch(() => {});
  const { error } = await admin.from("wallpapers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/wallpapers");
  revalidatePath("/");
}

export async function toggleFeatured(id: string, next: boolean) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("wallpapers").update({ is_featured: next }).eq("id", id);
  revalidatePath("/admin/wallpapers");
  revalidatePath("/");
}

/* ----------------------------- categories ----------------------------- */

export async function createCategory(name: string) {
  await assertAdmin();
  const clean = name.trim();
  if (!clean) throw new Error("Name required");
  const admin = createAdminClient();
  const { count } = await admin.from("categories").select("*", { count: "exact", head: true });
  const { error } = await admin.from("categories").insert({
    name: clean,
    slug: slugify(clean),
    sort_order: (count ?? 0) + 1,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
