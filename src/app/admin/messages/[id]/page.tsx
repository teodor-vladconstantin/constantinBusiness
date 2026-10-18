import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getMessage } from "@/lib/messages";
import { deleteMessage, toggleRead } from "../actions";

export const dynamic = "force-dynamic";

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const m = await getMessage(id);
  if (!m) notFound();
  return (
    <article className="max-w-[720px]">
      <Link href="/admin/messages" className="label hover:!text-fg">
        ← Messages
      </Link>
      <p className="label mt-3">{new Date(m.created_at).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}</p>
      <h1 className="title mt-1">{m.name}</h1>
      <p className="mt-1">
        <a className="underline underline-offset-4" href={`mailto:${m.email}`}>
          {m.email}
        </a>
      </p>
      <p className="prose-site mt-3 whitespace-pre-wrap">{m.message}</p>
      <div className="mt-4 flex gap-3 border-t border-line pt-3">
        <form action={toggleRead.bind(null, m.id, !m.read)}>
          <button type="submit" className="label hover:!text-fg">
            Mark as {m.read ? "unread" : "read"}
          </button>
        </form>
        <form action={deleteMessage.bind(null, m.id)}>
          <button type="submit" className="label hover:!text-fg">
            Delete
          </button>
        </form>
      </div>
    </article>
  );
}
