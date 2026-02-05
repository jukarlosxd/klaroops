-- Create Users Table (Mirror of NextAuth logic for reference, but mainly for Ambassadors/Clients)
create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'ambassador', 'client_user')),
  created_at timestamptz default now() not null
);

-- Create Ambassadors Table
create table if not exists public.ambassadors (
  id uuid primary key,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  commission_rule_json text default '{}',
  created_at timestamptz default now() not null,
  last_login_at timestamptz
);

-- Create Clients Table
create table if not exists public.clients (
  id uuid primary key,
  name text not null,
  legal_name text,
  industry text,
  status text not null default 'active',
  ambassador_id uuid references public.ambassadors(id) on delete set null,
  contract_value_cents bigint,
  contract_currency text default 'USD',
  contract_type text,
  contract_start timestamptz,
  contract_end timestamptz,
  billing_cycle text,
  onboarding_status text,
  notes_internal text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now(),
  last_activity_at timestamptz default now()
);

-- Create Client Users Table
create table if not exists public.client_users (
  id uuid primary key,
  user_id uuid references public.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  created_at timestamptz default now() not null
);

-- Create Commissions Table
create table if not exists public.commissions (
  id uuid primary key,
  ambassador_id uuid references public.ambassadors(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  amount_cents bigint not null,
  status text not null default 'pending',
  period_start timestamptz,
  period_end timestamptz,
  note text,
  created_at timestamptz default now() not null
);

-- Create Appointments Table
create table if not exists public.appointments (
  id uuid primary key,
  ambassador_id uuid references public.ambassadors(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  client_name text,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'scheduled',
  notes text
);

-- Create Dashboard Projects Table
create table if not exists public.dashboard_projects (
  id uuid primary key,
  client_id uuid references public.clients(id) on delete cascade,
  template_key text default 'default',
  data_source_type text default 'manual',
  data_source_config_json text default '{}',
  mapping_json text default '{}',
  kpi_rules_json text default '{}',
  chart_config_json text,
  dashboard_status text default 'not_started',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now()
);

-- Create Audit Logs Table
create table if not exists public.audit_logs (
  id uuid primary key,
  actor_user_id text,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_json text,
  after_json text,
  created_at timestamptz default now() not null
);

-- Create System Config Table
create table if not exists public.system_config (
  id text primary key,
  access_token text,
  refresh_token text,
  token_expiry bigint,
  updated_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.ambassadors enable row level security;
alter table public.clients enable row level security;
alter table public.client_users enable row level security;
alter table public.commissions enable row level security;
alter table public.appointments enable row level security;
alter table public.dashboard_projects enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_config enable row level security;

-- Create generic "allow all" policies for Authenticated users (Backend uses Service Role anyway)
create policy "Allow all for authenticated" on public.users for all to authenticated using (true);
create policy "Allow all for authenticated" on public.ambassadors for all to authenticated using (true);
create policy "Allow all for authenticated" on public.clients for all to authenticated using (true);
create policy "Allow all for authenticated" on public.client_users for all to authenticated using (true);
create policy "Allow all for authenticated" on public.commissions for all to authenticated using (true);
create policy "Allow all for authenticated" on public.appointments for all to authenticated using (true);
create policy "Allow all for authenticated" on public.dashboard_projects for all to authenticated using (true);
create policy "Allow all for authenticated" on public.audit_logs for all to authenticated using (true);
create policy "Allow all for authenticated" on public.system_config for all to authenticated using (true);

-- Ensure public access for Ambassador Applications (Already created in previous step, but ensuring safety)
-- (No action needed as previous migration handled it)
