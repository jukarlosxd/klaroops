import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDashboardData } from '@/lib/ambassador-db';
import { authOptions } from '@/lib/auth'; // Import authOptions if needed, or rely on default

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use the ID from the session to filter data
  // @ts-ignore
  const userId = session.user?.id;
  
  if (!userId) {
     return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
  }

  const data = getDashboardData(userId);
  return NextResponse.json(data);
}
