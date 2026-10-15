# Duku Constantin personal site: brief

Scope: work only inside ./constantinBusiness. Other project folders are read-only sources of facts.
Never open .env, key or token files. Never copy client data, user data, internal URLs or private individuals' names.
Owner: Duku Constantin, developer from Romania. Never mention age. Language: English.
Positioning: I understand a client's problem and turn the business need into a solution that fits their budget, without enterprise rigidity.
Domain: .tech, connected to Vercel later by the owner. Do not configure DNS.

## Projects (folder names exact)
airlife, divein, HSIC (entry in High School Innovation Challenge, 4-person team; name it after what the code says), joben-ai-resume, thinkup-gateway, ThinkUp-Intra, Nyra.
Excluded: FairHire, proofCV, joben-merge, security-agent, security-agen, wallet-setup, html, thinkup.
ThinkUp projects are team work. State role only as far as git history and docs prove. Credit "built with the ThinkUp team", no individual names.

## Links
- GitHub URL from `git remote -v` and `git config user.name` per project folder.
- Link a repo only if public. Private or org-owned: label "Private repository", no link, add to TODO list.
- GitHub profile (derive from remotes, owner confirms) and LinkedIn https://www.linkedin.com/in/dukuconstantin in header or footer, Contact and Home.

## Steps
1. Facts: site-facts/<project>.md per project. STOP, wait for corrections.
2. Skeleton: Next.js App Router, TypeScript, Tailwind, next/font. Pages: Home, Projects, /projects/[slug], Principles, About, Contact, Blog (MDX, empty, one placeholder post excluded from index). Tokens, grid, base components, motion primitives, no real content. Explain each file group in 3 to 5 lines. STOP with file tree and plan.
3. Content and build with corrected facts.
4. Polish: 375px, a11y, performance, SEO, OG images, sitemap, RSS, analytics, Lighthouse.

## Style: Swiss International / editorial, dark
Color: bg #111113, text #F4F4F5, secondary #A1A1AA, hairlines #2A2A2E, accent #EAB308 (one highlight per screen: main CTA, active states, dot-on-line diagram). Body stays off-white.
Type (next/font/google, latin + latin-ext): headings Poppins bold, line-height 0.95 to 1.05, letter-spacing -0.03em. Body Inter 16 to 18px, max 62ch, line-height 1.5. Labels JetBrains Mono uppercase 12px, letter-spacing 0.08em. Weights 400 and 700 only.
Layout: 12-col grid, 1200px container, 24px gutters, spacing multiples of 8. Section header: mono number, 1px rule above, title left, content right. Structure from 1px rules. Radius 0 to 2px.
Bans: gradients, glow, blur, glassmorphism, box shadows, rounded 3-column icon cards, centered hero with two buttons, emoji icons, stock illustrations, fake logos, fake counters, fake testimonials.

## Premium layer
- Dot-on-line diagram as spine. Home: line draws on scroll, accent dot marks active section. Project: three dots (problem, decision, result).
- Projects index as table: mono number, name, year, stack. Row hover inverts to accent bg with black text. Cursor-following preview, desktop only.
- Case study: sticky left column (title, role, stack, links), content right.
- Principles page "How I build": three numbered principles in large type.
- Lenis smooth scroll, off under prefers-reduced-motion.
- One easing: cubic-bezier(0.22, 1, 0.36, 1). Title reveal with overflow mask + translateY, 1px lines via scaleX, clip-path wipes, scroll progress line with mono section indicator. Page transitions under 400ms.
- Parallax only on hero and case-study images, few px, desktop only.
- Cmd+K command palette. next/og OG images per page. MDX blog with RSS. Optional /now. Vercel Analytics.
- Out of v1: WebGL, 3D, multi-layer parallax, custom cursor. New ideas go to v2.md.

## Copy rules
- Short sentences. Direct, specific, observational. No em dashes.
- No negation-then-positive structure ("not X, but Y", "X is not A. It is B").
- No self-labels, no superlatives, no hype words.
- Only facts proven by code or by the owner. Unverified: "TODO: Duku confirms", listed before launch.
- Joben: no claims about paying users or growth. Product and engineering decisions only. Numbers only if confirmed.

## Principles page (exact text, TODOs stay until confirmed)
1. Friction costs more than a missing feature.
   The ATS check on Joben is the first thing a person does with the product. Asking for an account before showing a result added friction, so I removed the login. I also found the homepage button sending visitors to sign-up instead of the no-account checker, and fixed it. [TODO: Duku confirms numbers and period]
2. I design the system, AI writes it.
   AI makes me faster at debugging and implementation. I decide the flows and the structure of the system and explain them clearly to the AI, because code written without that guidance works inside a system that makes no sense. [TODO: Duku adds one example from the listed projects]
3. The product moves with the client.
   At ThinkUp, development zones change often and counties move from one zone to another. I imported a custom map of Romania built around their zones. When the zone of a county changes, the high schools and ambassador students move with it automatically. [TODO: verify against ThinkUp-Intra or thinkup-gateway code]

## Pages
- Home: one-sentence intro, selected projects (table), principles teaser, GitHub and LinkedIn, contact.
- About: short, factual. Education and certifications only as confirmed. Else "TODO: Duku confirms".
- Contact: email "TODO: Duku confirms", LinkedIn, GitHub.

## Launch criteria
Lighthouse 95+ in all four. LCP under 2s. WCAG AA contrast. Works at 375px. Keyboard navigable. No TODO markers, no secrets, no private data. Every GitHub link verified public, every private repo labeled.

## Working rules
Short plan before large changes, wait at each STOP. Explain files after each block. Commit after each validated block. Ask one precise question when ambiguous.
