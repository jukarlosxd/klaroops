import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAmbassadorByUserId } from '@/lib/admin-db';
import { supabase } from '@/lib/supabase';

// PATCH /api/ambassador/leads/[id] (Update)
// DELETE /api/ambassador/leads/[id] (Delete)

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ambassador = await getAmbassadorByUserId(session.user.id);
    if (!ambassador) return NextResponse.json({ error: 'Ambassador not found' }, { status: 403 });

    const body = await req.json();
    
    // Security: Ensure lead belongs to ambassador via RLS (implicit) or explicit check
    // Supabase client uses service role? No, we use 'supabase' from lib which might be anon or admin depending on import.
    // Ideally we use a client scoped to the user, but since we are in API route, we often use admin client.
    // So we MUST strictly check ambassador_id match.
    
    const { data, error } = await supabase
        .from('ambassador_leads')
        .update(body)
        .eq('id', params.id)
        .eq('ambassador_id', ambassador.id) // Strict check
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ambassador = await getAmbassadorByUserId(session.user.id);
    if (!ambassador) return NextResponse.json({ error: 'Ambassador not found' }, { status: 403 });

    const { error } = await supabase
        .from('ambassador_leads')
        .delete()
        .eq('id', params.id)
        .eq('ambassador_id', ambassador.id); // Strict check

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
