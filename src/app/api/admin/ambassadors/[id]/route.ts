import { NextResponse } from 'next/server';
import { updateAmbassador, deleteAmbassador } from '@/lib/admin-db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const updated = await updateAmbassador(params.id, body, session.user?.email || 'admin');
    
    if (!updated) return NextResponse.json({ error: 'Ambassador not found' }, { status: 404 });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const success = await deleteAmbassador(params.id, session.user?.email || 'admin');
    
    if (!success) return NextResponse.json({ error: 'Ambassador not found' }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}