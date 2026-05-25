-- Ejecutar en Supabase → SQL Editor (una sola vez por proyecto)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  business_name text,
  notes text,
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

comment on table public.leads is 'Interesados en la beta capturados desde la landing.';

alter table public.leads enable row level security;

-- Las inserciones desde el backend usan la service role y no quedan bloqueadas por RLS.
-- No se añaden políticas públicas de INSERT para evitar abuso directo desde el cliente.
