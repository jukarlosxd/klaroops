import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { upsertDashboardProject } from '@/lib/admin-db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_id } = await req.json();
    
    const actorId = session.user?.email || 'admin';
    const project = await upsertDashboardProject(client_id, {
        dashboard_status: 'ready'
    }, actorId);

    return NextResponse.json(project);

  } catch (error: any) {
    return NextResponse.json({ error: 'Activation failed' }, { status: 500 });
  }
}
