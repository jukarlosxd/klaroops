import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateAppointment, deleteAppointment, getAppointmentById, getAmbassadorByUserId } from '@/lib/admin-db';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ambassador = await getAmbassadorByUserId(session.user.id);
  if (!ambassador) {
      return NextResponse.json({ error: 'Ambassador profile not found' }, { status: 403 });
  }

  const appointment = await getAppointmentById(params.id);
  if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  if (appointment.ambassador_id !== ambassador.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = await updateAppointment(params.id, body, session.user.email || session.user.id);
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

// Alias for PUT if legacy clients use it
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    return PATCH(request, { params });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ambassador = await getAmbassadorByUserId(session.user.id);
  if (!ambassador) {
      return NextResponse.json({ error: 'Ambassador profile not found' }, { status: 403 });
  }

  const appointment = await getAppointmentById(params.id);
  if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  if (appointment.ambassador_id !== ambassador.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await deleteAppointment(params.id, session.user.email || session.user.id);
  return NextResponse.json({ success: true });
}
