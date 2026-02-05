-- Create AI Threads table
create table if not exists public.ai_threads (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade,
  title text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create AI Messages table
create table if not exists public.ai_messages (
  id uuid default gen_random_uuid() primary key,
  thread_id uuid references public.ai_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.ai_threads enable row level security;
alter table public.ai_messages enable row level security;

-- Policies
create policy "Users can view threads for their client"
on public.ai_threads
for select
to authenticated
using (
  exists (
    select 1 from public.client_users
    where client_users.client_id = ai_threads.client_id
    and client_users.user_id = auth.uid()
  )
  or 
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

create policy "Users can insert threads for their client"
on public.ai_threads
for insert
to authenticated
with check (
  exists (
    select 1 from public.client_users
    where client_users.client_id = ai_threads.client_id
    and client_users.user_id = auth.uid()
  )
  or 
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

create policy "Users can view messages for their threads"
on public.ai_messages
for select
to authenticated
using (
  exists (
    select 1 from public.ai_threads
    join public.client_users on ai_threads.client_id = client_users.client_id
    where ai_messages.thread_id = ai_threads.id
    and client_users.user_id = auth.uid()
  )
  or 
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);

create policy "Users can insert messages for their threads"
on public.ai_messages
for insert
to authenticated
with check (
  exists (
    select 1 from public.ai_threads
    join public.client_users on ai_threads.client_id = client_users.client_id
    where ai_messages.thread_id = ai_threads.id
    and client_users.user_id = auth.uid()
  )
  or 
  exists (
    select 1 from public.users
    where users.id = auth.uid()
    and users.role = 'admin'
  )
);
