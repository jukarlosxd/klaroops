import { NextResponse } from 'next/server';
import { getClients, createClient } from '@/lib/db';

export async function GET() {
  const clients = getClients();
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newClient = {
    id: crypto.randomUUID(),
    name: body.name,
    template_id: body.template_id,
    spreadsheet_id: body.spreadsheet_id,
    last_sync: null
  };
  createClient(newClient);
  return NextResponse.json(newClient);
}
