export type WallpaperStatus = "draft" | "scheduled" | "pending" | "published" | "rejected";

export interface Category {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  count?: number;
}

export interface Wallpaper {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  storage_path: string;
  width: number;
  height: number;
  file_size: number;
  blurhash: string | null;
  dominant_color: string | null;
  palette: string[] | null;
  orientation: "portrait" | "landscape" | "square";
  device: string;
  category: string | null;
  category_id: string | null;
  tags: string[] | null;
  status: WallpaperStatus;
  is_featured: boolean;
  view_count: number;
  download_count: number;
  like_count: number;
  uploader_id: string | null;
  is_community: boolean;
  published_at: string | null;
  scheduled_for: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}
