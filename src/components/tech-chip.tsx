import {
  siAnthropic, siClerk, siFastapi, siJavascript, siLeaflet, siNextdotjs, siPython, siReact, siReactquery,
  siResend, siShadcnui, siStripe, siSupabase, siTailwindcss, siTypescript, siUpstash, siVite, siI18next,
  type SimpleIcon,
} from "simple-icons";

const icons: Record<string, SimpleIcon> = {
  "Next.js": siNextdotjs, TypeScript: siTypescript, Tailwind: siTailwindcss, Supabase: siSupabase,
  Clerk: siClerk, Leaflet: siLeaflet, Resend: siResend, Python: siPython, FastAPI: siFastapi,
  Vite: siVite, React: siReact, JavaScript: siJavascript, Stripe: siStripe, "Upstash Redis": siUpstash,
  "Anthropic API": siAnthropic, "shadcn/ui": siShadcnui, "React Query": siReactquery, "next-intl": siI18next,
};

// Tool icon plus name. Tools without a brand icon show the name only.
export function TechChip({ name }: { name: string }) {
  const icon = icons[name];
  return (
    <li className="flex items-center gap-1 border border-line px-1 py-[3px] font-mono text-[11px] leading-none text-muted">
      {icon && (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
          <path d={icon.path} />
        </svg>
      )}
      {name}
    </li>
  );
}
