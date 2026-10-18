create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  year text not null,
  one_liner text not null,
  role text not null,
  team text,
  context text,
  stack text[] not null default '{}',
  problem text not null default '',
  decision text not null default '',
  result text not null default '',
  in_code jsonb not null default '[]',
  scale text[] not null default '{}',
  repo_kind text not null default 'none' check (repo_kind in ('none', 'public', 'team', 'private')),
  repo_url text,
  live_url text,
  preview_path text,
  result_images text[] not null default '{}',
  internal boolean not null default false,
  study jsonb,
  position int not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "public reads published projects" on public.projects
  for select using (published = true);

insert into storage.buckets (id, name, public) values ('images', 'images', true)
  on conflict (id) do nothing;
-- Uploads and deletes use the service role key on the server. No write policies exist on purpose.
