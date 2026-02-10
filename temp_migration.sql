-- Create client_ai_profiles table for storing AI context per client
CREATE TABLE IF NOT EXISTS public.client_ai_profiles (
    client_id UUID PRIMARY KEY REFERENCES public.clients(id) ON DELETE CASCADE,
    business_type TEXT,
    ai_instructions TEXT,
    kpi_focus TEXT[], -- Array of strings, e.g. ['cost', 'uptime']
    forbidden_metrics TEXT[], -- Array of strings
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_ai_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admin can view/edit all profiles
CREATE POLICY "Admins can do everything on client_ai_profiles"
    ON public.client_ai_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Clients can view their own profile
CREATE POLICY "Clients can view their own AI profile"
    ON public.client_ai_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.client_users
            WHERE client_users.user_id = auth.uid()
            AND client_users.client_id = client_ai_profiles.client_id
        )
    );

-- Add 'dataset_profile_json' column to dashboard_projects if it doesn't exist
ALTER TABLE public.dashboard_projects 
ADD COLUMN IF NOT EXISTS dataset_profile_json JSONB DEFAULT '{}'::jsonb;
