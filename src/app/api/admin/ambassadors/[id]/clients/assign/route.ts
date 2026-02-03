import { NextResponse } from 'next/server';
import { updateClient } from '@/lib/admin-db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.clientId) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

    const updated = await updateClient(
      body.clientId, 
      { ambassador_id: params.id }, 
      session.user?.email || 'admin'
    );
    
    if (!updated) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}