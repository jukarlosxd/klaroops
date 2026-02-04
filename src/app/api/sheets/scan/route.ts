import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAuthenticatedClient } from '@/lib/google';
import { google } from 'googleapis';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { sheet_id, tab, header_row = 1 } = await req.json();

    if (!sheet_id) {
      return NextResponse.json({ error: 'sheet_id is required' }, { status: 400 });
    }

    const auth = await getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // Read headers and first 20 rows of data
    // Assuming header_row is 1-based index
    const dataStartRow = header_row + 1;
    const limit = 20;
    
    // Read Headers
    const headerRange = tab ? `${tab}!${header_row}:${header_row}` : `${header_row}:${header_row}`;
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: headerRange,
    });
    const headers = headerRes.data.values?.[0] || [];

    // Read Sample Data
    const dataRange = tab 
      ? `${tab}!${dataStartRow}:${dataStartRow + limit}` 
      : `${dataStartRow}:${dataStartRow + limit}`;
      
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

    return NextResponse.json({
      ok: true,
      headers,
      schema,
      row_count_preview: rows.length
    });

  } catch (error: any) {
    console.error('Sheet Scan Error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error.message 
    }, { status: 500 });
  }
}
