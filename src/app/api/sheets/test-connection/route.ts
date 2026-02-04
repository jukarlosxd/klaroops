import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAuthenticatedClient } from '@/lib/google';
import { google } from 'googleapis';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { sheet_id, tab } = await req.json();

    if (!sheet_id) {
      return NextResponse.json({ error: 'sheet_id is required' }, { status: 400 });
    }

    const auth = await getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // Try to read a small range (Header + 4 rows)
    // If tab is provided, use it. Otherwise default to first sheet usually, 
    // but range 'A1:Z5' works on the first visible sheet if no sheet name specified.
    const range = tab ? `${tab}!A1:Z5` : 'A1:Z5';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: range,
    });

    const rows = response.data.values || [];
    const headers = rows.length > 0 ? rows[0] : [];
    const sample_rows = rows.slice(1);

    return NextResponse.json({
      ok: true,
      headers,
      sample_rows,
      message: 'Connection successful'
    });

  } catch (error: any) {
    console.error('Sheet Connection Error:', error);
    
    // Handle specific Google API errors
    if (error.code === 403) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Permission Denied', 
        message: 'Please share the sheet with system@klaroops.com' 
      }, { status: 403 });
    }
    
    if (error.code === 404) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Not Found', 
        message: 'Spreadsheet ID not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: false, 
      error: error.message || 'Unknown Error' 
    }, { status: 500 });
  }
}
