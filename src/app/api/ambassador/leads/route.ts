import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAmbassadorByUserId } from '@/lib/admin-db';
import { supabase } from '@/lib/supabase';

// GET /api/ambassador/leads
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ambassador = await getAmbassadorByUserId(session.user.id);
    if (!ambassador) return NextResponse.json({ error: 'Ambassador not found' }, { status: 403 });

    const { data, error } = await supabase
        .from('ambassador_leads')
        .select('*')
        .eq('ambassador_id', ambassador.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
}

// POST /api/ambassador/leads (Create)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ambassador = await getAmbassadorByUserId(session.user.id);
    if (!ambassador) return NextResponse.json({ error: 'Ambassador not found' }, { status: 403 });

    const body = await req.json();
    
    // Simple validation
    if (!body.name || !body.company) {
        return NextResponse.json({ error: 'Name and Company are required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('ambassador_leads')
        .insert({
            ambassador_id: ambassador.id,
            name: body.name,
            company: body.company,
            industry: body.industry,
            status: body.status || 'new',
            notes: body.notes
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
