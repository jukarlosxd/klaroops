import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getClientByUserId, upsertDashboardProject } from '@/lib/admin-db';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await getClientByUserId(session.user.id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const mappingStr = formData.get('mapping') as string;
    const file = formData.get('file') as File;

    if (!file || !mappingStr) {
      return NextResponse.json({ error: 'Missing file or mapping' }, { status: 400 });
    }

    const mapping = JSON.parse(mappingStr);

    // Parse File
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Validate Data (Basic)
    if (jsonData.length === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    // Check for required columns
    const firstRow = jsonData[0] as any;
    if (!firstRow[mapping.date] || !firstRow[mapping.metric] || !firstRow[mapping.segment]) {
      return NextResponse.json({ error: 'Mapped columns not found in file' }, { status: 400 });
    }

    // Limit Data for Trial (e.g. 500 rows max for now to be safe in DB JSON)
    // Real app would use dedicated storage or table
    const limitedData = jsonData.slice(0, 1000); 

    // Create/Update Dashboard Project
    // Storing data directly in `dataset_profile_json` for MVP simplicity
    // In production, `dataset_profile_json` would be metadata, and data would be in a separate table/bucket
    const project = await upsertDashboardProject(client.id, {
      template_key: 'change_detection_v1',
      data_source_type: 'csv',
      data_source_config_json: JSON.stringify({ fileName: file.name, uploadedAt: new Date() }),
      mapping_json: mappingStr,
      kpi_rules_json: '{}', // Calculated dynamically for now
      dataset_profile_json: JSON.stringify(limitedData), // STORING DATA HERE FOR MVP
      dashboard_status: 'ready'
    }, session.user.id);

    return NextResponse.json({ success: true, projectId: project.id });

  } catch (error: any) {
    console.error('Create Dashboard Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
