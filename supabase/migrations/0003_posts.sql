create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 150),
  excerpt text not null default '' check (char_length(excerpt) <= 300),
  body_md text not null default '' check (char_length(body_md) <= 50000),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "public reads published posts" on public.posts
  for select using (status = 'published' and published_at is not null and published_at <= now());
