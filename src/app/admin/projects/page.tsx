import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { adminListProjects } from "@/lib/projects-admin";
import { moveProject, setPublished } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProjects() {
  await requireAdmin();
  const projects = await adminListProjects();
  return (
    <>
      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="title">Projects</h1>
        <Link href="/admin/projects/new" className="bg-accent px-2 py-1 font-mono text-[12px] uppercase tracking-[0.08em] !text-black">
          New project
        </Link>
      </div>
      <ul className="border-t border-line">
        {projects.map((p, i) => (
          <li key={p.id} className="grid grid-cols-12 items-center gap-x-3 gap-y-1 border-b border-line py-2">
            <span className="label col-span-1">{String(i + 1).padStart(2, "0")}</span>
            <span className="col-span-11 md:col-span-4">
              <Link href={`/admin/projects/${p.id}`} className="font-heading text-[18px] font-bold tracking-[-0.03em] hover:!text-accent">
                {p.name}
              </Link>
              <span className="label ml-2">{p.study ? "Case study" : "Project"}</span>
            </span>
            <span className="label col-span-6 md:col-span-3">{p.published ? "Published" : "Hidden"}</span>
            <div className="col-span-6 flex justify-end gap-3 md:col-span-4">
              <form action={moveProject.bind(null, p.id, "up")}>
                <button type="submit" disabled={i === 0} aria-label={`Move ${p.name} up`} className="label hover:!text-fg disabled:opacity-30">
                  Up
                </button>
              </form>
              <form action={moveProject.bind(null, p.id, "down")}>
                <button type="submit" disabled={i === projects.length - 1} aria-label={`Move ${p.name} down`} className="label hover:!text-fg disabled:opacity-30">
                  Down
                </button>
              </form>
              <form action={setPublished.bind(null, p.id, !p.published)}>
                <button type="submit" className="label hover:!text-fg">
                  {p.published ? "Hide" : "Show"}
                </button>
              </form>
              <Link href={`/admin/projects/${p.id}`} className="label !text-fg">
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
