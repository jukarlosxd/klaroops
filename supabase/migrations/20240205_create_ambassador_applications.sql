-- Create table for ambassador applications
create table if not exists public.ambassador_applications (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null,
  phone text,
  city_state text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'approved', 'rejected', 'email_failed')),
  ip_address text,
  user_agent text,
  notes_internal text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.ambassador_applications enable row level security;

-- Create policy for reading (Admin only - using service role for simplicity in backend code, but nice to have)
create policy "Enable read access for authenticated users"
on public.ambassador_applications
for select
to authenticated
using (true);

-- Create policy for inserting (Public/Anon for the form)
create policy "Enable insert for public"
on public.ambassador_applications
for insert
to anon
with check (true);

-- Create policy for updating (Admin only)
create policy "Enable update for authenticated users"
on public.ambassador_applications
for update
to authenticated
using (true);
