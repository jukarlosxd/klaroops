import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateDashboardConfig } from '@/lib/llm';
import { upsertDashboardProject } from '@/lib/admin-db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { client_id, template_key, headers, sample_rows, inferred_types } = body;

    // 1. Generate Config with LLM
    const generated = await generateDashboardConfig(
        template_key || 'custom',
        headers,
        sample_rows,
        inferred_types
    );

    // 2. Save Draft to DB
    const actorId = session.user?.email || 'admin';
    await upsertDashboardProject(client_id, {
        template_key: template_key,
        data_source_config_json: JSON.stringify(generated.source_config),
        mapping_json: JSON.stringify(generated.column_mapping),
        kpi_rules_json: JSON.stringify(generated.kpi_rules),
        chart_config_json: JSON.stringify(generated.chart_config),
        dashboard_status: 'configuring'
    }, actorId);

    return NextResponse.json(generated);

  } catch (error: any) {
    console.error('Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
