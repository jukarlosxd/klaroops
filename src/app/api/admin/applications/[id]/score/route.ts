import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // 1. Auth Check
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    // 2. Fetch Application
    const { data: app, error } = await supabase
      .from('ambassador_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 3. AI Scoring Logic (Rule-based)
    let score = 10; // Base score
    const reasons: string[] = ['Base score: 10'];
    const msgLower = (app.message || '').toLowerCase();
    const fullText = JSON.stringify(app).toLowerCase();

    // -- Positive Signals --
    
    // Company presence (assume company info might be in message if no column, but here we check fields if they existed, or generic text)
    // Since we only have specific columns, we check if they look like corporate emails or message content
    if (app.email.includes('@gmail') || app.email.includes('@outlook') || app.email.includes('@yahoo')) {
        // Personal email, no bonus
    } else {
        score += 20;
        reasons.push('+20: Corporate email domain detected');
    }

    if (app.phone && app.phone.length > 5) {
        score += 10;
        reasons.push('+10: Phone number provided');
    }

    if (app.city_state && app.city_state.length > 2) {
        score += 5;
        reasons.push('+5: Location provided');
    }

    // Intent keywords
    const intentWords = ['demo', 'pricing', 'quote', 'urgent', 'asap', 'budget', 'automate', 'dashboard', 'cost', 'hire'];
    if (intentWords.some(w => msgLower.includes(w))) {
        score += 15;
        reasons.push('+15: High intent keywords detected');
    }

    // Pain points
    const painWords = ['manual', 'slow', 'errors', 'visibility', 'reporting', 'production', 'ops', 'kpi', 'mess', 'chaos'];
    if (painWords.some(w => msgLower.includes(w))) {
        score += 15;
        reasons.push('+15: Pain points/Needs clearly identified');
    }

    // Scale/Volume
    const sizeWords = ['printers', 'machines', 'orders', 'units', '100+', 'daily', 'weekly', 'employees', 'staff'];
    if (sizeWords.some(w => msgLower.includes(w))) {
        score += 10;
        reasons.push('+10: Scale/Volume indicators found');
    }

    // -- Negative Signals --

    if (!app.message || app.message.length < 20) {
        score -= 30;
        reasons.push('-30: Message too short or empty');
    }

    const spamWords = ['crypto', 'forex', 'seo guarantee', 'investment', 'lottery', 'winner', 'click here', 'viagra'];
    if (spamWords.some(w => msgLower.includes(w))) {
        score -= 40;
        reasons.push('-40: Potential spam keywords detected');
    }

    // Clamp Score
    score = Math.max(0, Math.min(100, score));

    // Determine Tier
    let tier = 'cold';
    if (score >= 70) tier = 'hot';
    else if (score >= 40) tier = 'warm';

    // Generate Suggested Message
    let suggestedMessage = '';
    const firstName = app.full_name.split(' ')[0];

    if (tier === 'hot') {
        suggestedMessage = `Hi ${firstName},\n\nThanks for your application! I saw you're interested in improving your operations. Given your requirements, I think we're a great fit. Can we jump on a quick call tomorrow?\n\nBest,\n[Your Name]`;
    } else if (tier === 'warm') {
        suggestedMessage = `Hi ${firstName},\n\nThanks for reaching out. We'd love to learn more about what you're looking for. Could you share a bit more detail about your current volume?\n\nBest,\n[Your Name]`;
    } else {
        suggestedMessage = `Hi ${firstName},\n\nThanks for your interest. At the moment, we are focusing on slightly different use cases, but we'll keep your info on file for future opportunities.\n\nBest,\n[Your Name]`;
    }

    // 4. Update DB
    const updates = {
        ai_score: score,
        ai_tier: tier,
        ai_reasons: reasons, // Supabase handles array -> jsonb automatically usually, or we stringify
        ai_suggested_message: suggestedMessage,
        ai_updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
        .from('ambassador_applications')
        .update(updates)
        .eq('id', id);

    if (updateError) {
        console.error('Scoring update failed', updateError);
        return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ...updates });

  } catch (e: any) {
    console.error('Scoring error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
