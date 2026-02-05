import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Note: For backend operations (admin-db), we prefer the SERVICE_ROLE_KEY if available
// to bypass RLS or simply to have full access. 
// For client-side operations, we would use the ANON_KEY.

export const supabase = createClient(supabaseUrl, supabaseKey);
