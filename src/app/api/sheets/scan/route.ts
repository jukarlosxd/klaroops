import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGoogleAccessToken, getOAuth2Client } from '@/lib/google-auth';
import { google } from 'googleapis';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { sheet_id, tab, header_row = 1 } = await req.json();

    console.log(`[SheetScan] Starting scan for Sheet ID: ${sheet_id} (Tab: ${tab || 'Default'})`);

    if (!sheet_id) {
      return NextResponse.json({ error: 'sheet_id is required' }, { status: 400 });
    }

    // 1. Get Token from Central Auth (system@klaroops.com)
    // This handles refresh automatically via supabaseAdmin
    const accessToken = await getGoogleAccessToken();
    
    // 2. Create Auth Client
    const auth = getOAuth2Client();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    // Read headers and first 20 rows of data
    // Assuming header_row is 1-based index
    const dataStartRow = header_row + 1;
    const limit = 20;
    
    // Read Headers
    const headerRange = tab ? `${tab}!${header_row}:${header_row}` : `${header_row}:${header_row}`;
    console.log(`[SheetScan] Fetching headers from: ${headerRange}`);
    
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: headerRange,
    });
    const headers = headerRes.data.values?.[0] || [];

    // Read Sample Data
    const dataRange = tab 
      ? `${tab}!${dataStartRow}:${dataStartRow + limit}` 
      : `${dataStartRow}:${dataStartRow + limit}`;
      
    console.log(`[SheetScan] Fetching data from: ${dataRange}`);

    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: dataRange,
    });
    const rows = dataRes.data.values || [];

    // Infer Types
    const schema = headers.map((header, index) => {
      // Check column values
      const values = rows.map(r => r[index]).filter(v => v !== undefined && v !== '');
      let type = 'string';
      
      if (values.length > 0) {
        const isNumber = values.every(v => !isNaN(Number(v.replace(/[,.$]/g, ''))));
        if (isNumber) type = 'number';
        // Date detection could be added here
      }

      return {
        name: header,
        type,
        sample: values[0] || null
      };
    });

    console.log(`[SheetScan] Success. Found ${headers.length} columns and ${rows.length} preview rows.`);

    return NextResponse.json({
      ok: true,
      headers,
      schema,
      row_count_preview: rows.length
    });

  } catch (error: any) {
    console.error('[SheetScan] Error:', error?.response?.data || error.message);
    
    // Detect specific Google API errors
    const status = error?.code || 500;
    const message = error?.message || 'Internal Server Error';

    if (status === 403 || message.includes('permission')) {
        return NextResponse.json({ 
            ok: false, 
            error: `Permission denied. Please share the sheet with system@klaroops.com (or the connected email).` 
        }, { status: 403 });
    }

    if (status === 404) {
        return NextResponse.json({ 
            ok: false, 
            error: `Spreadsheet not found. Check ID.` 
        }, { status: 404 });
    }

    return NextResponse.json({ 
      ok: false, 
      error: message 
    }, { status: status });
  }
}
