import Link from "next/link";
import { projects } from "@/lib/projects";

// Projects index as a table: mono number, name, year, stack. Stack is filled in Step 3.
export function ProjectTable() {
  return (
    <ul className="border-t border-line">
      {projects.map((p, i) => (
        <li key={p.slug} className="border-b border-line">
          <Link href={`/projects/${p.slug}`} className="row-invert grid grid-cols-12 items-baseline gap-x-3 px-1 py-2">
            <span className="label col-span-2 md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
            <span className="col-span-7 font-heading text-[22px] font-bold leading-none tracking-[-0.03em] md:col-span-6">{p.name}</span>
            <span className="label col-span-3 text-right md:col-span-2 md:text-left">{p.year}</span>
            <span className="label hidden md:col-span-3 md:block">Stack</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
