import { ogSize, renderOg } from "@/lib/og";
import { site } from "@/lib/site";

export const size = ogSize;
export const contentType = "image/png";
export const alt = site.name;

// Applies to every route that has no OG image of its own.
export default function Image() {
  return renderOg({ label: "Developer from Romania", title: site.name });
}
