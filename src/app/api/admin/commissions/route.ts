import { NextResponse } from 'next/server';
import { createCommission, updateCommission } from '@/lib/admin-db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const newComm = await createCommission({
        ambassador_id: body.ambassador_id,
        client_id: body.client_id || null,
        amount_cents: body.amount_cents,
        status: body.status || 'pending',
        period_start: body.period_start,
        period_end: body.period_end,
        note: body.note
    }, session.user?.email || 'admin');

    return NextResponse.json(newComm);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
    try {
      const body = await request.json();
      if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

      const updated = await updateCommission(body.id, body.data, session.user?.email || 'admin');
      return NextResponse.json(updated);
    } catch (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}