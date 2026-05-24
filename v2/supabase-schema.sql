-- AgenticFlow V2 Schema
-- Run this in Supabase SQL Editor

create table if not exists leads (
  id               uuid primary key default gen_random_uuid(),
  business_name    text not null,
  contact_name     text,
  address          text,
  website_url      text,
  social_links     jsonb,
  report_url       text,
  landing_page_url text,
  email_draft      text,
  email_subject    text,
  status           text not null default 'new_lead',
  score            integer,
  industry         text,
  city             text,
  weakness_summary text,
  research_notes   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists agent_logs (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references leads(id) on delete set null,
  agent_name text not null,
  action     text not null,
  result     text,
  error      text,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists leads_updated_at on leads;
create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- Indexes
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_created_at_idx on leads(created_at desc);
create index if not exists agent_logs_lead_id_idx on agent_logs(lead_id);
create index if not exists agent_logs_created_at_idx on agent_logs(created_at desc);

-- Enable Realtime
alter publication supabase_realtime add table leads;
alter publication supabase_realtime add table agent_logs;
