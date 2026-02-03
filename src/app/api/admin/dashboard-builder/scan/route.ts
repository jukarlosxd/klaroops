import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scanSheet, parseSheetIdFromUrl } from '@/lib/google-sheets';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sheet_url, sheet_id, tab } = await req.json();
    
    let targetId = sheet_id;
    if (sheet_url) {
        try {
            targetId = parseSheetIdFromUrl(sheet_url);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }
    }

    if (!targetId) {
        return NextResponse.json({ error: 'Sheet ID or URL required' }, { status: 400 });
    }

    const result = await scanSheet(targetId, tab);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Scan Error:', error);
    return NextResponse.json({ error: error.message || 'Scan failed' }, { status: 500 });
  }
}
