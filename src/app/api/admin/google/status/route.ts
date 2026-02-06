import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// This endpoint is for debugging purposes only.
// It checks the state of the Google Integration without exposing sensitive tokens.
export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Strict Admin Check
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('google_integrations')
      .select('email, updated_at, expiry_ts, refresh_token, access_token, provider')
      .eq('provider', 'google')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
        return NextResponse.json({ 
            status: 'error', 
            dbError: error.message 
        });
    }

    if (!data) {
        return NextResponse.json({ 
            status: 'not_found', 
            message: 'No row found in google_integrations for provider=google' 
        });
    }

    // Safe response (no tokens printed)
    const hasRefreshToken = !!data.refresh_token && data.refresh_token.length > 10;
    const hasAccessToken = !!data.access_token && data.access_token.length > 10;
    const supabaseUrl = process.env.SUPABASE_URL || 'unknown';
    const supabaseUrlFingerprint = supabaseUrl.slice(-6);

    return NextResponse.json({
        status: 'connected',
        email: data.email,
        updated_at: data.updated_at,
        expiry_ts: data.expiry_ts,
        has_refresh_token: hasRefreshToken,
        has_access_token: hasAccessToken,
        provider: data.provider,
        env: {
            supabase_url_fingerprint: supabaseUrlFingerprint
        }
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
