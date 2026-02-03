import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAdminStats } from '@/lib/ambassador-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession();
  
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = getAdminStats();
  return NextResponse.json(data);
}
