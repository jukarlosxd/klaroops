import { NextResponse } from 'next/server';
import { createAmbassadorApplication } from '@/lib/admin-db';
import { headers } from 'next/headers';

// Rate Limit Map (Simple In-Memory for Demo)
// In production, use Redis or similar
const RATE_LIMIT_MAP = new Map<string, { count: number, lastTime: number }>();
const LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

export async function POST(req: Request) {
  try {
    const ip = headers().get('x-forwarded-for') || 'unknown';
    const userAgent = headers().get('user-agent') || 'unknown';

    // 1. Rate Limiting
    const now = Date.now();
    const userLimit = RATE_LIMIT_MAP.get(ip) || { count: 0, lastTime: now };
    
    if (now - userLimit.lastTime > LIMIT_WINDOW) {
      // Reset window
      userLimit.count = 1;
      userLimit.lastTime = now;
    } else {
      userLimit.count++;
    }
    RATE_LIMIT_MAP.set(ip, userLimit);

    if (userLimit.count > MAX_REQUESTS) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();

    // 2. Honeypot Check (Anti-Spam)
    if (body.company) {
      // Silently fail for bots
      return NextResponse.json({ ok: true });
    }

    // 3. Validation
    if (!body.full_name || body.full_name.length < 2) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!body.email || !body.email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!body.message || body.message.length < 10) {
      return NextResponse.json({ error: 'Message is too short' }, { status: 400 });
    }

    // 4. Save to DB
    const application = await createAmbassadorApplication({
      full_name: body.full_name,
      email: body.email,
      phone: body.phone,
      city_state: body.city_state,
      message: body.message
    }, ip, userAgent);

    // 5. Send Email (Resend)
    // We use a try-catch specifically for email to not fail the whole request if email service is down
    try {
        if (process.env.RESEND_API_KEY) {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: 'KlaroOps Applications <onboarding@resend.dev>', // Update with verified domain in prod
                    to: ['jukarlosxd@gmail.com'],
                    subject: `New Ambassador Application: ${body.full_name}`,
                    html: `
                        <h1>New Ambassador Application</h1>
                        <p><strong>Name:</strong> ${body.full_name}</p>
                        <p><strong>Email:</strong> ${body.email}</p>
                        <p><strong>Phone:</strong> ${body.phone || 'N/A'}</p>
                        <p><strong>Location:</strong> ${body.city_state || 'N/A'}</p>
                        <p><strong>Message:</strong></p>
                        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 3px solid #ccc;">
                            ${body.message.replace(/\n/g, '<br/>')}
                        </blockquote>
                        <hr/>
                        <p><small>IP: ${ip} | User-Agent: ${userAgent}</small></p>
                    `
                })
            });
            
            if (!res.ok) {
                console.error('Email API Error:', await res.text());
            }
        } else {
            console.log('Skipping email send: RESEND_API_KEY not found');
        }
    } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue to return success to user since DB save worked
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Application Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
