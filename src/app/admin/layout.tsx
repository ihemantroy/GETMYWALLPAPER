import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Upload, Inbox, Images, Tags, DownloadCloud, ArrowLeft } from "lucide-react";
import { isAdmin, getSessionUser } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/upload", label: "Upload", icon: Upload },
  { href: "/admin/import", label: "Import (Pexels)", icon: DownloadCloud },
  { href: "/admin/queue", label: "Review queue", icon: Inbox },
  { href: "/admin/wallpapers", label: "Wallpapers", icon: Images },
  { href: "/admin/categories", label: "Categories", icon: Tags },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login?next=/admin");
  if (!(await isAdmin())) redirect("/");

  return (
    <div className="flex min-h-screen">
      <aside className="surface sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 rounded-none border-y-0 border-l-0 p-4 md:flex">
        <Link href="/" className="mb-4 flex items-center gap-2 px-3 py-2 text-sm text-chalk-muted hover:text-chalk">
          <ArrowLeft size={15} /> Back to site
        </Link>
        <p className="px-3 pb-2 font-display text-lg font-semibold">
          <span className="text-accent">Get</span>YW Admin
        </p>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="focusable flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-chalk-muted transition hover:bg-white/5 hover:text-chalk"
          >
            <Icon size={17} /> {label}
          </Link>
        ))}
        <p className="mt-auto px-3 text-xs text-chalk-faint">{user.email}</p>
      </aside>
      <div className="flex-1 px-6 py-8 md:px-10">{children}</div>
    </div>
  );
}
