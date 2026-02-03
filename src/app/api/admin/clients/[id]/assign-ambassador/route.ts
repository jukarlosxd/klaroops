import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assignClientToAmbassador } from '@/lib/admin-db';

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
    const { ambassador_id } = body;
    const actorId = session.user?.email || 'unknown_admin';

    const updatedClient = await assignClientToAmbassador(params.id, ambassador_id, actorId);
    
    if (!updatedClient) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error: any) {
    console.error('Error assigning client:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
