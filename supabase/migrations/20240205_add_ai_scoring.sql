-- Add AI Scoring columns to ambassador_applications table
alter table public.ambassador_applications
add column if not exists ai_score int,
add column if not exists ai_tier text check (ai_tier in ('hot', 'warm', 'cold')),
add column if not exists ai_reasons jsonb,
add column if not exists ai_suggested_message text,
add column if not exists ai_updated_at timestamptz;
