-- ================================================================
-- Flüxa CRM · Supabase Migration
-- Execute no SQL Editor do Supabase
-- ================================================================

-- companies
create table if not exists companies (
  id                   uuid primary key default gen_random_uuid(),
  company_name         text not null,
  company_slug         text not null unique,
  company_logo_url     text,
  company_phone        text,
  whatsapp_instance    text,
  whatsapp_number      text,
  pricing_config_json  jsonb,
  crm_active           boolean default true,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- company_auth
create table if not exists company_auth (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid references companies(id) on delete cascade,
  company_slug    text not null unique,
  password_hash   text not null,
  active          boolean default true,
  last_login_at   timestamptz,
  created_at      timestamptz default now()
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
  active        boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- leads
create table if not exists leads (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid references companies(id) on delete cascade,
  nome             text not null,
  telefone         text,
  email            text,
  origem           text,
  lead_source      text,
  servico          text,
  largura          numeric,
  altura           numeric,
  tipo_vidro       text,
  espessura        numeric,
  area             numeric,
  valor_estimado   numeric,
  status           text check (status in ('ativo','ganho','perdido','inativo')) default 'ativo',
  pipeline_stage   text check (pipeline_stage in ('Novo Lead','Qualificado','Reunião Marcada','Proposta','Fechado','Perdido')) default 'Novo Lead',
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
  message_type  text default 'text',
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

-- ── Row Level Security ──────────────────────────────────────────────────────
-- (opcional mas recomendado em produção)
-- alter table leads enable row level security;
-- create policy "company isolation" on leads
--   using (company_id = current_setting('app.company_id')::uuid);

-- ── Seed de Exemplo ──────────────────────────────────────────────────────────
insert into companies (id, company_name, company_slug, crm_active)
values
  ('00000000-0000-0000-0000-000000000001', 'Flüxa Solar',  'fluxa',    true),
  ('00000000-0000-0000-0000-000000000002', 'VidraMax',     'vidramax', true)
on conflict do nothing;

insert into company_auth (company_id, company_slug, password_hash, active)
values
  ('00000000-0000-0000-0000-000000000001', 'fluxa',    'fluxa123',    true),
  ('00000000-0000-0000-0000-000000000002', 'vidramax', 'vidra123',    true)
on conflict do nothing;

insert into users (company_id, full_name, display_name, email, role, active)
values
  ('00000000-0000-0000-0000-000000000001', 'Matheus Carvalho', 'Matheus', 'matheus@fluxa.com',   'founder',  true),
  ('00000000-0000-0000-0000-000000000002', 'Ana Lima',         'Ana',     'ana@vidramax.com',    'gestor',   true)
on conflict do nothing;
