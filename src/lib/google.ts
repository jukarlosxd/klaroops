import { google } from 'googleapis';
import { getSystemConfig, updateSystemConfig } from '@/lib/admin-db';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

export const getOAuth2Client = () => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing Google OAuth Credentials in .env');
  }

  return new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
};

export const getAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets.readonly'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Crucial for receiving a refresh token
    scope: scopes,
    prompt: 'consent' // Force consent to ensure refresh token is returned
  });
};

export const getAuthenticatedClient = async () => {
  const oauth2Client = getOAuth2Client();
  const config = await getSystemConfig();

  if (!config || !config.refresh_token) {
    throw new Error('System not connected to Google. Please authenticate via Admin Panel.');
  }

  oauth2Client.setCredentials({
    access_token: config.access_token,
    refresh_token: config.refresh_token,
    expiry_date: config.token_expiry
  });

  // Auto-refresh logic handled by googleapis, but we need to save new tokens if they change
  oauth2Client.on('tokens', async (tokens) => {
    console.log('Google Tokens Refreshed');
    await updateSystemConfig({
      access_token: tokens.access_token ?? config.access_token,
      refresh_token: tokens.refresh_token ?? config.refresh_token, // Sometimes refresh token is not returned on refresh
      token_expiry: tokens.expiry_date ?? config.token_expiry
    });
  });

  return oauth2Client;
};
