import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOAuth2Client } from '@/lib/google';
import { updateSystemConfig } from '@/lib/admin-db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Protect: Only Admin can finish this flow
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: `Google Auth Error: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    await updateSystemConfig({
      access_token: tokens.access_token || null,
      refresh_token: tokens.refresh_token || null,
      token_expiry: tokens.expiry_date || null
    });

    // Redirect back to admin settings with success
    return NextResponse.redirect(new URL('/admin/settings?google_auth=success', req.url));

  } catch (error: any) {
    console.error('Error exchanging token:', error);
    return NextResponse.json({ error: 'Failed to exchange token', details: error.message }, { status: 500 });
  }
}
