-- Add selected_sheets_json to dashboard_projects
ALTER TABLE public.dashboard_projects
ADD COLUMN IF NOT EXISTS selected_sheets_json JSONB DEFAULT '[]'::jsonb;
