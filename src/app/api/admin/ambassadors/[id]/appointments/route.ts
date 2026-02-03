import { NextResponse } from 'next/server';
import { getAppointments, createAppointment } from '@/lib/admin-db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Admin check could be here (assuming all authenticated users in admin route are admins for now, 
  // or relying on layout protection)

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('from') || undefined;
  const endDate = searchParams.get('to') || undefined;

  const appointments = await getAppointments(params.id, startDate, endDate);
  return NextResponse.json(appointments);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.start_at || !body.end_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAppointment = await createAppointment(
      params.id,
      {
        client_id: body.client_id || null,
        title: body.title,
        start_at: body.start_at,
        end_at: body.end_at,
        status: 'scheduled',
        notes: body.notes || ''
      },
      session.user?.email || 'admin' // Actor ID
    );

    return NextResponse.json(newAppointment);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
