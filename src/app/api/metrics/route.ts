import { NextResponse } from 'next/server';
import { getClientEvents } from '@/lib/db';
import { calculateMetrics } from '@/lib/metrics';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  
  if (!clientId) {
    return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
  }

  const events = getClientEvents(clientId);
  const metrics = calculateMetrics(events);
  
  return NextResponse.json(metrics);
}
