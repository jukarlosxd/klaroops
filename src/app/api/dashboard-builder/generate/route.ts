import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { groq, GROQ_MODELS } from '@/lib/groq';
import { z } from 'zod';

// Zod Schema for Validation
const DashboardConfigSchema = z.object({
  kpis: z.array(z.object({
    id: z.string().optional(),
    label: z.string(),
    metric: z.string(),
    aggregation: z.string()
  })),
  charts: z.array(z.object({
    type: z.string(),
    title: z.string(),
    x: z.string(),
    y: z.string(),
    aggregation: z.string().optional(),
    groupBy: z.string().optional()
  })),
  notes: z.array(z.string()).optional()
});

// Simple Rate Limiting (In-memory)
const rateLimitMap = new Map<string, { count: number, lastTime: number }>();
function isRateLimited(userId: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxRequests = 5; // 5 generations per hour (expensive operation)

    const userRecord = rateLimitMap.get(userId) || { count: 0, lastTime: now };
    if (now - userRecord.lastTime > windowMs) {
        rateLimitMap.set(userId, { count: 1, lastTime: now });
        return false;
    }
    if (userRecord.count >= maxRequests) return true;
    userRecord.count++;
    rateLimitMap.set(userId, userRecord);
    return false;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  if (isRateLimited(userId)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again in an hour.' }, { status: 429 });
  }

  try {
    const { columns, sampleData, metadata } = await req.json();

    if (!columns || !sampleData) {
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Construct Context for LLM
    const dataContext = JSON.stringify({
        metadata,
        columns: columns.map((c: any) => ({ name: c.name, type: c.type })), // Simplified columns
        sample_rows: sampleData.slice(0, 3) // Only 3 rows to save tokens
    }, null, 2);

    const systemPrompt = `You are an expert Data Visualization Architect.
    Your goal is to automatically generate a Dashboard Configuration based on the provided dataset.
    
    Dataset Context:
    ${dataContext}
    
    Task:
    1. Identify 3-5 key Performance Indicators (KPIs) that would be valuable for business monitoring.
    2. Identify 3-5 Charts that visualize trends, distributions, or comparisons.
    3. Identify any potential data quality issues.

    Output Requirement:
    - You MUST output ONLY valid JSON.
    - Do not include markdown code blocks (like \`\`\`json).
    - The JSON structure must match this schema:
    {
      "kpis": [
        { "id": "string", "label": "string", "metric": "column_name", "aggregation": "sum|avg|count|min|max" }
      ],
      "charts": [
        { 
          "type": "line|bar|pie|table", 
          "title": "string", 
          "x": "column_name", 
          "y": "column_name", 
          "aggregation": "sum|avg|count|none", 
          "groupBy": "column_name (optional)"
        }
      ],
      "notes": ["string"]
    }
    `;

    let completion;
    try {
        completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: "Generate dashboard configuration." }
            ],
            model: GROQ_MODELS.POWERFUL, // Using 70b for better reasoning
            temperature: 0.1, // Low temperature for consistent JSON
            response_format: { type: 'json_object' } // Force JSON mode
        });
    } catch (groqError: any) {
        // Fallback for decommissioned models or temporary errors
        if (groqError?.error?.code === 'model_decommissioned' || groqError?.status === 404) {
            console.warn('Groq Model Decommissioned/Not Found, retrying with fallback...', groqError);
            completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: "Generate dashboard configuration." }
                ],
                model: 'llama-3.3-70b-versatile', // Explicit fallback
                temperature: 0.1,
                response_format: { type: 'json_object' }
            });
        } else {
            throw groqError;
        }
    }

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
        throw new Error('Empty response from AI');
    }

    // Parse JSON
    let result;
    try {
        result = JSON.parse(content);
        // Validate with Zod
        DashboardConfigSchema.parse(result);
    } catch (e) {
        console.error('JSON Parse/Validation Error:', e);
        // Fallback or specific error handling
        return NextResponse.json({ error: 'Generated configuration invalid' }, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (e: any) {
    console.error('Dashboard Builder Error:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
