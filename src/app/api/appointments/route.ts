import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAppointments, createAppointment, getAmbassadorByUserId } from '@/lib/admin-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let ambassadorId = '';

  if (session.user.role === 'admin') {
      // For admin hitting this endpoint, require specific filter or return empty?
      // User requirements say "Portal endpoints always use ambassador_id from session"
      // So if admin uses this, maybe they act as themselves? But they don't have ambassador_id.
      // We'll return 403 or empty.
      return NextResponse.json([]); 
  } else {
      const ambassador = await getAmbassadorByUserId(session.user.id);
      if (!ambassador) return NextResponse.json({ error: 'Ambassador not found' }, { status: 404 });
      ambassadorId = ambassador.id;
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const data = await getAppointments(ambassadorId, startDate, endDate);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ambassador = await getAmbassadorByUserId(session.user.id);
  if (!ambassador) {
      return NextResponse.json({ error: 'Ambassador profile not found' }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    // Support both camelCase and snake_case
    const title = body.title;
    const startAt = body.startAt || body.start_at;
    const endAt = body.endAt || body.end_at;
    const clientId = body.clientId || body.client_id;
    const clientName = body.clientName || body.client_name;
    const notes = body.notes;

    if (!title || !startAt || !endAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAppt = await createAppointment(ambassador.id, {
      title,
      client_id: clientId || null,
      client_name: clientName, // This might be deprecated if we strictly use client_id, but keeping for compatibility
      start_at: startAt,
      end_at: endAt,
      status: 'scheduled',
      notes
    }, session.user.email || session.user.id);

    return NextResponse.json(newAppt);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
