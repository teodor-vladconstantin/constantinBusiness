import Link from "next/link";
import { PageTitle } from "@/components/section";

export default function NotFound() {
  return (
    <>
      <PageTitle label="404" title="Page not found" />
      <p className="container-site">
        <Link href="/" className="label !text-accent">
          Back to home
        </Link>
      </p>
    </>
  );
}
