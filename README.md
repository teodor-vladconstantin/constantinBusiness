# constantinBusiness

Site personal de prezentare al lui Duku Constantin, developer independent (forward deployed engineer). Conține pagini despre proiecte, modul de lucru, un blog cu editor de administrare și un formular de contact.

## Pentru cine

Pentru fondatori și echipe mici care caută un developer care înțelege problema de business și livrează software funcțional în bugetul clientului. Repo-ul este și un exemplu de cod pentru un site Next.js cu CMS propriu.

## Stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS
- Supabase (baza de date pentru proiecte și articole, autentificare admin)
- Cloudflare Turnstile (protecție formular de contact)
- Vercel (hosting și analytics)
- Vitest (teste)

## Cum rulezi local

1. Instalează Node.js (versiune recentă LTS).
2. `npm install`
3. Copiază `.env.example` în `.env.local` și completează valorile (Supabase, `ADMIN_EMAIL`, Turnstile). Nu comite `.env.local`.
4. Aplică migrările din `supabase/migrations` pe proiectul tău Supabase.
5. `npm run dev`, apoi deschide http://localhost:3000.

Alte comenzi: `npm run typecheck`, `npm test`, `npm run build`, `npm start`.

## Structură

- `src/app` pagini și rute
- `src/lib` configurare site și acces la date
- `supabase/migrations` schema bazei de date
- `docs` planuri de implementare

## Licență

MIT, vezi [LICENSE](LICENSE).
