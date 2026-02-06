import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/admin/settings?error=google_auth_error', req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin/settings?error=no_code', req.url));
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Verify email
    const oauth2 = google.oauth2('v2');
    const userInfo = await oauth2.userinfo.get({ auth: oauth2Client as any });
    const email = userInfo.data.email;

    if (!email) {
      throw new Error('No email found in Google Profile');
    }

    if (!tokens.refresh_token) {
        // If refresh_token is missing, we must fail because we can't maintain connection.
        // This usually happens if the user already granted permissions before.
        // We can force it by adding prompt='consent' (which we did), but if it fails here, 
        // we might need to revoke first? Or just warn.
        console.warn('Missing refresh_token! Connection will expire soon.');
        // For now, let's allow it but log it. Or throw? 
        // DB constraint says NOT NULL. So we MUST throw or provide a dummy.
        // If we throw, the user gets an error. If we provide dummy, it breaks later.
        // BETTER: Try to fetch existing refresh_token if we are re-connecting? 
        // But we just deleted it. 
        // We MUST have refresh_token. 
        throw new Error('Google did not return a refresh token. Please revoke access in Google Account permissions and try again.');
    }

    // Force DELETE old integration first using Admin Client
    await supabaseAdmin.from('google_integrations').delete().eq('provider', 'google');

    // Insert new using Admin Client (Bypass RLS)
    const { error: dbError } = await supabaseAdmin.from('google_integrations').insert({
      provider: 'google',
      email: email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token, 
      expiry_ts: new Date(tokens.expiry_date || Date.now() + 3600 * 1000).toISOString()
    });

    if (dbError) {
        console.error('Supabase Insert Error:', dbError);
        throw dbError;
    }

    return NextResponse.redirect(new URL('/admin/settings?success=google_connected', req.url));

  } catch (e: any) {
    console.error('Google Callback Error:', e);
    return NextResponse.redirect(new URL(`/admin/settings?error=${encodeURIComponent(e.message)}`, req.url));
  }
}
