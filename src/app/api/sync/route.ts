import { NextResponse } from 'next/server';
import { getClient, clearClientEvents, insertEvents } from '@/lib/db';
import { getSheetRows } from '@/lib/sheets';
import { normalizeOpsWalkthrough } from '@/lib/normalize';

export async function POST(req: Request) {
  const { clientId, tenantId } = await req.json();
  const client = getClient(tenantId, clientId);
  
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const rows = await getSheetRows(client.config.metadata.spreadsheetId || '');
  
  // Normalize based on template
  let events;
  // For MVP we only support ops-walkthrough really, but structure implies more
  if (client.config.templateId === 'ops-walkthrough') {
    events = normalizeOpsWalkthrough(rows, clientId);
  } else {
    // Default fallback
    events = normalizeOpsWalkthrough(rows, clientId);
  }

  // Sync Strategy: Replace all events for simplicity and consistency
  clearClientEvents(tenantId, clientId);
  insertEvents(tenantId, events);
  
  // updateClientSync(clientId, new Date().toISOString());
  
  return NextResponse.json({ success: true, count: events.length });
}
