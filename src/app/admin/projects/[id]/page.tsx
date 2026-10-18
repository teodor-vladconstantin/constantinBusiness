import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { adminGetProject } from "@/lib/projects-admin";
import { deleteProject } from "../actions";
import { ProjectForm } from "./project-form";

export const dynamic = "force-dynamic";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const row = id === "new" ? null : await adminGetProject(id);
  if (id !== "new" && !row) notFound();
  const imageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;
  return (
    <>
      <Link href="/admin/projects" className="label hover:!text-fg">
        ← Projects
      </Link>
      <h1 className="title mb-4 mt-2">{row ? row.name : "New project"}</h1>
      <ProjectForm row={row} imageBase={imageBase} />
      {row && (
        <form action={deleteProject.bind(null, row.id)} className="mt-12 grid max-w-[560px] gap-2 border-t border-line pt-3">
          <p className="label">Delete project</p>
          <label className="flex items-center gap-2">
            <input type="checkbox" required />
            <span className="text-[15px]">I understand this removes the project and its images.</span>
          </label>
          <button type="submit" className="label justify-self-start hover:!text-fg">
            Delete
          </button>
        </form>
      )}
    </>
  );
}
