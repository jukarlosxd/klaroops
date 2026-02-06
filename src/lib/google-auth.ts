import { OAuth2Client } from 'google-auth-library';
import { supabase, supabaseAdmin } from './supabase';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Robust URL resolution: 
// 1. NEXT_PUBLIC_APP_URL (Explicit override)
// 2. NEXTAUTH_URL (Standard NextAuth var)
// 3. VERCEL_URL (Vercel Preview/Prod - needs https:// prepended)
// 4. Localhost fallback
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
};

const REDIRECT_URI = `${getBaseUrl()}/api/admin/google/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn('Missing Google OAuth Credentials (CLIENT_ID or CLIENT_SECRET)');
}

export const getOAuth2Client = () => {
  return new OAuth2Client(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
};

export const generateAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force refresh token
    scope: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/userinfo.email' // To verify system@klaroops.com
    ],
    include_granted_scopes: true
  });
};

export const getGoogleAccessToken = async () => {
  // 1. Fetch integration
  // Use supabaseAdmin to bypass RLS, ensuring we can always read system tokens
  console.log('[GoogleAuth] Fetching system@klaroops.com integration from DB...');
  const { data: integration, error } = await supabaseAdmin
    .from('google_integrations')
    .select('*')
    .eq('provider', 'google')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !integration) {
    console.error('[GoogleAuth] DB Error or No Integration found:', error);
    throw new Error('Google Sheets integration not connected. Connect system@klaroops.com first.');
  }

  const expiry = new Date(integration.expiry_ts).getTime();
  const now = Date.now();
  
  console.log(`[GoogleAuth] Token found. Expiry: ${new Date(expiry).toISOString()} (Now: ${new Date().toISOString()})`);

  // If valid for at least 5 more minutes, return it
  if (expiry > now + 5 * 60 * 1000) {
    console.log('[GoogleAuth] Returning existing valid access_token');
    return integration.access_token;
  }

  // Refresh Token
  console.log('[GoogleAuth] Access token expired/expiring. Refreshing...');
  if (!integration.refresh_token) {
      console.error('[GoogleAuth] CRITICAL: No refresh_token available for rotation.');
      throw new Error('No refresh_token found. Please reconnect integration.');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: integration.refresh_token
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    console.log('[GoogleAuth] Token refreshed successfully.');
    
    // Update DB
    await supabaseAdmin
      .from('google_integrations')
      .update({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || integration.refresh_token, // Sometimes not returned
        expiry_ts: new Date(credentials.expiry_date || Date.now() + 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', integration.id);

    return credentials.access_token;
  } catch (e: any) {
    console.error('[GoogleAuth] Failed to refresh token:', e?.response?.data || e.message);
    throw new Error('Failed to refresh Google Token. Please reconnect integration.');
  }
};

export const getGoogleIntegrationStatus = async () => {
    // Use supabaseAdmin to bypass RLS
    const { data } = await supabaseAdmin
        .from('google_integrations')
        .select('email, updated_at')
        .eq('provider', 'google')
        .limit(1)
        .single();
    return data;
};
