import { NextResponse } from 'next/server';
import { createClient } from '@/lib/admin-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, workspaceName } = body;

    if (!email || !password || !workspaceName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 7-day trial
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    // Create Client + User (Self-Serve)
    const newClient = await createClient({
      name: workspaceName,
      status: 'active',
      plan: 'trial',
      subscription_status: 'trial',
      trial_ends_at: trialEnd.toISOString(),
      onboarding_status: 'new',
      login_email: email,
      login_password: password,
      ambassador_id: null // Self-serve
    }, 'signup-system');

    return NextResponse.json({ 
      success: true, 
      clientId: newClient.id,
      email: email 
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
}
