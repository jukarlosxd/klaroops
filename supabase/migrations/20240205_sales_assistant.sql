-- Create ambassador_leads table
CREATE TABLE IF NOT EXISTS public.ambassador_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_id UUID NOT NULL REFERENCES public.ambassadors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    industry TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'negotiation', 'closed', 'lost')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ambassador_ai_messages table
CREATE TABLE IF NOT EXISTS public.ambassador_ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_id UUID NOT NULL REFERENCES public.ambassadors(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    lead_id UUID REFERENCES public.ambassador_leads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ambassador_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_ai_messages ENABLE ROW LEVEL SECURITY;

-- Policies for ambassador_leads
-- Ambassadors can only see/edit their own leads
CREATE POLICY "Ambassadors can view own leads" 
ON public.ambassador_leads FOR SELECT 
USING (
    ambassador_id IN (
        SELECT id FROM public.ambassadors 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Ambassadors can insert own leads" 
ON public.ambassador_leads FOR INSERT 
WITH CHECK (
    ambassador_id IN (
        SELECT id FROM public.ambassadors 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Ambassadors can update own leads" 
ON public.ambassador_leads FOR UPDATE 
USING (
    ambassador_id IN (
        SELECT id FROM public.ambassadors 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Ambassadors can delete own leads" 
ON public.ambassador_leads FOR DELETE 
USING (
    ambassador_id IN (
        SELECT id FROM public.ambassadors 
        WHERE user_id = auth.uid()
    )
);

-- Policies for ambassador_ai_messages
-- Ambassadors can only see/insert their own messages
CREATE POLICY "Ambassadors can view own messages" 
ON public.ambassador_ai_messages FOR SELECT 
USING (
    ambassador_id IN (
        SELECT id FROM public.ambassadors 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Ambassadors can insert own messages" 
ON public.ambassador_ai_messages FOR INSERT 
WITH CHECK (
    ambassador_id IN (
        SELECT id FROM public.ambassadors 
        WHERE user_id = auth.uid()
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ambassador_leads_ambassador_id ON public.ambassador_leads(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_ai_messages_ambassador_id ON public.ambassador_ai_messages(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_ai_messages_lead_id ON public.ambassador_ai_messages(lead_id);
