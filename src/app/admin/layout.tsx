import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { email } = await requireAdmin();
  return (
    <div className="container-site py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
        <nav aria-label="Admin" className="flex gap-3">
          <Link href="/admin/messages" className="label !text-fg">
            Messages
          </Link>
        </nav>
        <form action={signOut} className="flex items-center gap-2">
          <span className="label">{email}</span>
          <button type="submit" className="label hover:!text-fg">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
