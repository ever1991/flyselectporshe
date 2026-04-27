-- Fly Select — submissions table
-- Correr este SQL en Supabase SQL editor

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text not null,
  city text,
  profile text,
  routes text,
  annual_hours text,
  passengers text,
  trip_nature text,
  aircraft text[],
  pillars text[],
  current_situation text,
  interests text[],
  consult text,
  schedule text,
  privacy_accepted boolean not null default false,
  meta jsonb
);

create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);

create index if not exists submissions_email_idx
  on public.submissions (email);

alter table public.submissions enable row level security;

-- Sólo el service_role (usado por la API en Vercel) puede insertar/leer.
-- No se crean políticas para anon/authenticated → todo bloqueado por RLS.
