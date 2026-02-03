import { NextResponse } from 'next/server';
import { updateAmbassador } from '@/lib/admin-db';
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
    if (!body.password) return NextResponse.json({ error: 'New password required' }, { status: 400 });

    const updated = await updateAmbassador(
      params.id, 
      { password: body.password }, 
      session.user?.email || 'admin'
    );
    
    if (!updated) return NextResponse.json({ error: 'Ambassador not found' }, { status: 404 });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}