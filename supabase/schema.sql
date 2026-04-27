-- Fly Select — submissions
-- Correr este SQL en el SQL Editor de Supabase (proyecto compartido).
-- Crea un schema propio para no mezclar con tablas de otros proyectos.

create schema if not exists fly_select;

create table if not exists fly_select.submissions (
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
  on fly_select.submissions (created_at desc);

create index if not exists submissions_email_idx
  on fly_select.submissions (email);

alter table fly_select.submissions enable row level security;

-- Permitir al service_role acceder al schema (la API en Vercel usa service_role)
grant usage on schema fly_select to service_role;
grant all on fly_select.submissions to service_role;

-- Exponer el schema vía PostgREST para que supabase-js lo pueda leer
-- (en Supabase Dashboard → Settings → API → Exposed schemas, agregar "fly_select")

-- No se crean políticas para anon/authenticated → todo bloqueado por RLS
