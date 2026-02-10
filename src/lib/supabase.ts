import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing. Supabase connection will fail.');
}

// Default client (might be anon or admin depending on env)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Explicit Admin Client (Bypass RLS)
// This should ONLY be used in server-side API routes or Server Components.
export const supabaseAdmin = (() => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        // Fallback to anon key if service role is missing, but log warning
        return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key');
    }
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
})();
