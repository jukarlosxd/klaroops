import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { upsertDashboardProject } from '@/lib/admin-db';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Auth Check
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const actorId = session.user?.email || 'unknown_admin';

    const project = await upsertDashboardProject(params.id, body, actorId);
    
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Error upserting dashboard project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
