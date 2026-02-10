import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scanSheetsMulti, parseSheetIdFromUrl } from '@/lib/google-sheets';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sheet_url, client_id, selected_sheets } = await req.json();
    
    let targetId;
    try {
        targetId = parseSheetIdFromUrl(sheet_url);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!targetId) {
        return NextResponse.json({ error: 'Sheet ID required' }, { status: 400 });
    }

    // Use multi-sheet scan
    const result = await scanSheetsMulti(targetId, selected_sheets);
    
    // Save state if client_id provided
    if (client_id) {
        // We update selected sheets and dataset profile
        await supabase
            .from('dashboard_projects')
            .update({
                data_source_config_json: JSON.stringify({ sheetId: targetId }), // Persist ID
                selected_sheets_json: result.selectedSheets,
                dataset_profile_json: result.profiles // Store array of profiles
            })
            .eq('client_id', client_id);
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Scan Error:', error);
    return NextResponse.json({ error: error.message || 'Scan failed' }, { status: 500 });
  }
}
