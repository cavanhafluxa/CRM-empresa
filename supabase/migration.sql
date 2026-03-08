-- ================================================================
-- Flüxa CRM v2 · Migration completa
-- Execute no SQL Editor do Supabase
-- ================================================================

-- companies
create table if not exists companies (
  id                  uuid primary key default gen_random_uuid(),
  company_name        text not null,
  company_slug        text not null unique,
  company_logo_url    text,
  company_phone       text,
  whatsapp_number     text,
  crm_active          boolean default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- company_auth
create table if not exists company_auth (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid references companies(id) on delete cascade,
  company_slug   text not null unique,
  password_hash  text not null,
  active         boolean default true,
  last_login_at  timestamptz,
  created_at     timestamptz default now()
);

-- users
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references companies(id) on delete cascade,
  full_name     text not null,
  display_name  text,
  email         text,
  avatar_url    text,
  role          text check (role in ('founder','gestor','colaborador')) default 'colaborador',
  username      text,
  password_hash text,
  active        boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- funnels (funis por colaborador/gestor)
create table if not exists funnels (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  name        text not null,
  owner_id    uuid references users(id) on delete set null,
  created_at  timestamptz default now()
);

-- pipeline_columns (nomes visuais das colunas - por empresa)
create table if not exists pipeline_columns (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  stage_key   text not null,
  label       text not null,
  created_at  timestamptz default now(),
  unique(company_id, stage_key)
);

-- leads
create table if not exists leads (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid references companies(id) on delete cascade,
  funnel_id        uuid references funnels(id) on delete set null,
  assigned_to      uuid references users(id) on delete set null,
  nome             text not null,
  telefone         text,
  email            text,
  origem           text,
  servico          text,
  area             numeric,
  valor_estimado   numeric,
  status           text check (status in ('ativo','ganho','perdido','inativo')) default 'ativo',
  pipeline_stage   text default 'Novo Lead',
  nivel_interesse  int check (nivel_interesse between 1 and 5),
  resumo_gestor    text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- lead_notes
create table if not exists lead_notes (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  lead_id     uuid references leads(id) on delete cascade,
  user_id     uuid references users(id) on delete set null,
  user_name   text,
  note        text not null,
  created_at  timestamptz default now()
);

-- meetings
create table if not exists meetings (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  lead_id     uuid references leads(id) on delete set null,
  event_type  text check (event_type in ('reuniao','visita','instalacao')) default 'reuniao',
  title       text not null,
  description text,
  start_at    timestamptz not null,
  end_at      timestamptz,
  status      text check (status in ('pendente','confirmado','cancelado')) default 'pendente',
  created_by  uuid references users(id) on delete set null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- quotes
create table if not exists quotes (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  lead_id     uuid references leads(id) on delete cascade,
  servico     text,
  area        numeric,
  valor       numeric,
  pdf_url     text,
  sent_at     timestamptz,
  created_at  timestamptz default now()
);

-- messages
create table if not exists messages (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid references companies(id) on delete cascade,
  lead_id       uuid references leads(id) on delete set null,
  telefone      text,
  direction     text check (direction in ('in','out')) default 'in',
  message_text  text not null,
  created_at    timestamptz default now()
);

-- activity_logs
create table if not exists activity_logs (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  user_id     uuid references users(id) on delete set null,
  lead_id     uuid references leads(id) on delete set null,
  action      text not null,
  metadata    jsonb,
  created_at  timestamptz default now()
);

-- support_tickets
create table if not exists support_tickets (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references companies(id) on delete cascade,
  user_id     uuid references users(id) on delete set null,
  user_name   text,
  message     text not null,
  status      text default 'aberto',
  created_at  timestamptz default now()
);

-- ── Seed ────────────────────────────────────────────────────────
insert into companies (id, company_name, company_slug, crm_active)
values
  ('00000000-0000-0000-0000-000000000001', 'Flüxa Solar',  'fluxa',    true),
  ('00000000-0000-0000-0000-000000000002', 'VidraMax',     'vidramax', true)
on conflict do nothing;

insert into company_auth (company_id, company_slug, password_hash, active)
values
  ('00000000-0000-0000-0000-000000000001', 'fluxa',    'fluxa123', true),
  ('00000000-0000-0000-0000-000000000002', 'vidramax', 'vidra123', true)
on conflict do nothing;

insert into users (id, company_id, full_name, display_name, email, role, username, password_hash, active)
values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Eliezer Cavanha', 'Eliezer', 'eliezer@fluxa.com', 'founder', 'eliezer', 'fluxa123', true),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', 'Gestor VidraMax', 'Gestor', 'gestor@vidramax.com', 'gestor', 'gestor', 'vidra123', true)
on conflict do nothing;

-- Funil padrão para cada empresa
insert into funnels (id, company_id, name, owner_id)
values
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Funil Geral', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 'Funil Geral', '00000000-0000-0000-0000-000000000011')
on conflict do nothing;
