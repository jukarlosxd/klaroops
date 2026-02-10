-- Add subscription fields to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_renews_at timestamptz;

-- Add check constraints for valid values (optional but good for data integrity)
ALTER TABLE public.clients
ADD CONSTRAINT clients_plan_check 
CHECK (plan IN ('trial', 'starter', 'growth', 'pro'));

ALTER TABLE public.clients
ADD CONSTRAINT clients_subscription_status_check 
CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trial', 'expired'));
