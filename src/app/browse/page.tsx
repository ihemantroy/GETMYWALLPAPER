import { redirect } from "next/navigation";
export default async function BrowseRedirect({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => { if (typeof v === "string") qs.set(k, v); });
  const s = qs.toString();
  redirect(s ? `/?${s}` : "/");
}
