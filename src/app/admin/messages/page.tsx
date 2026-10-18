import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listMessages } from "@/lib/messages";

export const dynamic = "force-dynamic";

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function Messages() {
  await requireAdmin();
  const messages = await listMessages();
  const unread = messages.filter((m) => !m.read).length;
  return (
    <>
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="title">Messages</h1>
        <p className="label">
          {unread} unread / {messages.length} total
        </p>
      </div>
      {messages.length === 0 ? (
        <p className="prose-site text-muted">No messages yet.</p>
      ) : (
        <ul className="border-t border-line">
          {messages.map((m) => (
            <li key={m.id} className="border-b border-line">
              <Link href={`/admin/messages/${m.id}`} className="row-invert grid grid-cols-12 gap-x-3 px-1 py-2">
                <span className="label col-span-12 md:col-span-3">{when(m.created_at)}</span>
                <span className={`col-span-12 md:col-span-3 ${m.read ? "" : "font-bold"}`}>{m.name}</span>
                <span className="col-span-12 truncate md:col-span-6">{m.message}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
