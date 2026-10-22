import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="container-site flex flex-wrap items-center justify-between gap-2 py-4">
        <p className="label">{site.name}</p>
        <ul className="flex gap-3">
          <li>
            <Link className="label hover:!text-fg" href="/privacy">
              Privacy
            </Link>
          </li>
          <li>
            <Link className="label hover:!text-fg" href="/terms">
              Terms
            </Link>
          </li>
          <li>
            <a className="label hover:!text-fg" href={site.linkedin} rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          {site.github && (
            <li>
              <a className="label hover:!text-fg" href={site.github} rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          )}
        </ul>
      </div>
    </footer>
  );
}
