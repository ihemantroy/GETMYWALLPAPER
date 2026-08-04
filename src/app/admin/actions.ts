"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { notifyNewWallpaper } from "@/lib/push";
import { embedImageUrl } from "@/lib/ai";
import { publicUrl } from "@/lib/supabase/storage";

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
  devices?: string[];
  tags: string[];
  category_id?: string | null;
  credit?: string | null;
  credit_url?: string | null;
  description?: string;
  alt_text?: string;
  scheduled_for?: string | null;
  is_featured?: boolean;
}) {
  await assertAdmin();
  const admin = createAdminClient();
  const scheduled = input.scheduled_for && new Date(input.scheduled_for) > new Date();
  const slug = `${slugify(input.title)}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;
  const { data: inserted, error } = await admin
    .from("wallpapers")
    .insert({
      slug,
      title: input.title,
      description: input.description ?? null,
      alt_text: input.alt_text ?? null,
      storage_path: input.storage_path,
      width: input.width,
      height: input.height,
      file_size: input.file_size,
      orientation: input.width >= input.height ? "landscape" : "portrait",
      device: input.device,
      devices: input.devices && input.devices.length ? input.devices : [input.device],
      category_id: input.category_id ?? null,
      credit: input.credit?.trim() || null,
      credit_url: input.credit_url?.trim() || null,
      tags: input.tags,
      is_featured: input.is_featured ?? false,
      status: scheduled ? "scheduled" : "published",
      scheduled_for: scheduled ? input.scheduled_for : null,
      published_at: scheduled ? null : new Date().toISOString(),
    })
    .select("id, storage_path")
    .single();
  if (error) throw new Error(error.message);
  if (!scheduled) await notifyNewWallpaper(input.title, slug);

  // Best-effort embedding for semantic search + find-similar. Never blocks
  // publishing if the AI key is missing or the call fails.
  if (inserted) {
    embedImageUrl(publicUrl(inserted.storage_path))
      .then((vec) => admin.from("wallpapers").update({ embedding: vec }).eq("id", inserted.id))
      .catch((e) => console.error("embedImageUrl failed", e instanceof Error ? e.message : e));
  }

  revalidatePath("/");
}

export async function updateWallpaper(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    alt_text?: string | null;
    category_id?: string | null;
    devices?: string[];
    tags?: string[];
    credit?: string | null;
    credit_url?: string | null;
  },
) {
  await assertAdmin();
  const admin = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (typeof input.title === "string" && input.title.trim()) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description?.trim() || null;
  if (input.alt_text !== undefined) patch.alt_text = input.alt_text?.trim() || null;
  if (input.category_id !== undefined) patch.category_id = input.category_id || null;
  if (input.devices && input.devices.length) {
    patch.devices = input.devices;
    patch.device = input.devices[0];
  }
  if (input.tags) patch.tags = input.tags;
  if (input.credit !== undefined) patch.credit = input.credit?.trim() || null;
  if (input.credit_url !== undefined) patch.credit_url = input.credit_url?.trim() || null;
  const { error } = await admin.from("wallpapers").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/wallpapers");
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

export async function setWotd(id: string, next: boolean) {
  await assertAdmin();
  const admin = createAdminClient();
  if (next) {
    // only one at a time — clear any existing WOTD first
    await admin.from("wallpapers").update({ is_wotd: false }).eq("is_wotd", true);
    await admin.from("wallpapers").update({ is_wotd: true }).eq("id", id);
  } else {
    await admin.from("wallpapers").update({ is_wotd: false }).eq("id", id);
  }
  revalidatePath("/");
  revalidatePath("/admin/wallpapers");
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

export async function toggleParallax(id: string, next: boolean) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("wallpapers").update({ is_parallax: next }).eq("id", id);
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

export async function updateCategoryDescription(id: string, description: string) {
  await assertAdmin();
  const admin = createAdminClient();
  const clean = description.trim();
  const { error } = await admin
    .from("categories")
    .update({ description: clean.length ? clean : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  // Revalidate the public collection page so the new copy shows immediately.
  const { data: cat } = await admin.from("categories").select("slug").eq("id", id).maybeSingle();
  if (cat?.slug) revalidatePath(`/wallpapers/${cat.slug}`);
}

