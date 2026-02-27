-- ============================================================
-- B3.Pet Portal — Migration SQL
-- Cole no SQL Editor do Supabase e clique em Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- 1. user_profiles
create table if not exists public.user_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  role       text not null default 'viewer' check (role in ('admin','viewer')),
  full_name  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: cria perfil automaticamente ao criar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. portal_settings (single row)
create table if not exists public.portal_settings (
  id           int primary key default 1 check (id = 1),
  portal_title text not null default 'B3.Pet Analytics',
  report_id    text,
  embed_url    text,
  active_mode  text not null default 'report_id' check (active_mode in ('report_id','embed_url')),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users(id)
);

insert into public.portal_settings (id) values (1)
on conflict (id) do nothing;

-- 3. audit_logs — campo event_type (não "event")
create table if not exists public.audit_logs (
  id         bigserial primary key,
  event_type text not null,
  user_id    uuid references auth.users(id),
  user_email text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);

-- 4. RLS
alter table public.user_profiles  enable row level security;
alter table public.portal_settings enable row level security;
alter table public.audit_logs      enable row level security;

-- user_profiles: cada usuário lê/edita apenas o próprio
drop policy if exists "user_profiles: self read"   on public.user_profiles;
drop policy if exists "user_profiles: self update" on public.user_profiles;

create policy "user_profiles: self read"
  on public.user_profiles for select using (auth.uid() = id);

create policy "user_profiles: self update"
  on public.user_profiles for update using (auth.uid() = id);

-- portal_settings: qualquer autenticado lê; service_role atualiza
drop policy if exists "portal_settings: read"   on public.portal_settings;
drop policy if exists "portal_settings: update" on public.portal_settings;

create policy "portal_settings: read"
  on public.portal_settings for select using (auth.role() = 'authenticated');

create policy "portal_settings: update"
  on public.portal_settings for update using (auth.role() = 'authenticated');

-- audit_logs: apenas service_role insere/lê (sem policy → bloqueado para anon/authenticated)
drop policy if exists "audit_logs: service insert" on public.audit_logs;
drop policy if exists "audit_logs: service select" on public.audit_logs;

create policy "audit_logs: service insert"
  on public.audit_logs for insert with check (true);

create policy "audit_logs: service select"
  on public.audit_logs for select using (true);

-- ============================================================
-- PRIMEIRO ADMIN: após criar usuário no Supabase Auth, rode:
--   UPDATE public.user_profiles SET role = 'admin' WHERE email = 'seu@email.com';
-- ============================================================
