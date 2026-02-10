-- Create google_integrations table for central OAuth
CREATE TABLE IF NOT EXISTS public.google_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT DEFAULT 'google',
    email TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expiry_ts TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_integrations ENABLE ROW LEVEL SECURITY;

-- Policies: Only Admin can access
CREATE POLICY "Admins can do everything on google_integrations"
    ON public.google_integrations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );
