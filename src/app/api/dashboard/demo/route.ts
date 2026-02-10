import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getClientByUserId, upsertDashboardProject, updateClient } from '@/lib/admin-db';
import { generateMessyData } from '@/lib/demo-data';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await getClientByUserId(session.user.id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // 1. Create Demo Project
    const demoData = generateMessyData();
    const demoMapping = {
        date: 'Date',
        metric: 'Cost',
        segment: 'Project',
        subsegment: 'Category'
    };

    await upsertDashboardProject(client.id, {
      template_key: 'change_detection_v1',
      data_source_type: 'manual',
      data_source_config_json: JSON.stringify({ fileName: 'Demo Construction Data', isDemo: true }),
      mapping_json: JSON.stringify(demoMapping),
      kpi_rules_json: '{}',
      dataset_profile_json: JSON.stringify(demoData),
      dashboard_status: 'ready'
    }, session.user.id);

    // 2. Advance Onboarding State
    // From 'new' -> 'onboarding' (Tour triggers on 'onboarding')
    await updateClient(client.id, { onboarding_status: 'onboarding' }, session.user.id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Demo Setup Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
