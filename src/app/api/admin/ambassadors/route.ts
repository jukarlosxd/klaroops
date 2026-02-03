import { NextResponse } from 'next/server';
import { createAmbassador } from '@/lib/admin-db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAmbassador = await createAmbassador({
      name: body.name,
      email: body.email,
      password: body.password,
      status: body.status || 'active',
      commission_rule_json: body.commission_rule_json || '{"rate": 0.10}',
    }, session.user?.email || 'admin');

    return NextResponse.json(newAmbassador);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}