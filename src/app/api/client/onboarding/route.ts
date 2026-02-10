import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getClientByUserId, updateClient } from '@/lib/admin-db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await getClientByUserId(session.user.id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const { status } = await req.json();
    
    if (!['new', 'onboarding', 'live'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await updateClient(client.id, { onboarding_status: status }, session.user.id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
