import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getClientEvents } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        message: {
          role: 'assistant',
          content: 'OpenAI API Key is missing. Please configure it in the settings or environment variables.'
        }
      });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const { messages, clientId, tenantId } = await req.json();

    // Get context
    const events = getClientEvents(tenantId, clientId);
    const recentEvents = events.slice(-10); // Get last 10 events for context

    // Construct system message
    const systemMessage = {
      role: 'system',
      content: `You are KlaroOps AI, a metrics interpreter for an operations dashboard.

      CORE RULES:
      - You NEVER read raw rows directly (you only see aggregated metrics).
      - You ONLY explain what is visible in the dashboard based on the provided metrics.
      - Your goal is to summarize, prioritize, and rephrase insights.
      - If you don't have enough data, say so.
      - Be concise, professional, and "boring" (internal tool style).

      RECENT EVENTS (for context):
      ${JSON.stringify(recentEvents, null, 2)}

      DASHBOARD STRUCTURE:
      - Availability % (Today)
      - Downtime Count (Incidents Today)
      - Broken Assets Count
      - Top Problem Areas (Last 7 days)
      - 7-Day Trend
      `
    };

    // @ts-ignore
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [systemMessage, ...messages],
    });

    return NextResponse.json({ message: completion.choices[0].message });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
