import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  createAIThread, 
  addAIMessage, 
  getAIMessages, 
  getClientContextForAI, 
  getClientByUserId 
} from '@/lib/admin-db';
import { groq, GROQ_MODELS } from '@/lib/groq';

// Simple Rate Limiting Map (In-memory for demo, Redis for production)
const rateLimitMap = new Map<string, { count: number, lastTime: number }>();

function isRateLimited(userId: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10; // 10 messages per minute

    const userRecord = rateLimitMap.get(userId) || { count: 0, lastTime: now };
    
    if (now - userRecord.lastTime > windowMs) {
        // Reset window
        rateLimitMap.set(userId, { count: 1, lastTime: now });
        return false;
    }

    if (userRecord.count >= maxRequests) {
        return true;
    }

    userRecord.count++;
    rateLimitMap.set(userId, userRecord);
    return false;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  if (isRateLimited(userId)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
  }

  try {
    const { message, clientId, threadId: existingThreadId } = await req.json();

    // 1. Validate Access
    // If user is admin, allow any clientId. If user is client_user, ensure they own the client.
    let verifiedClientId = clientId;
    const userRole = (session.user as any).role;
    
    if (userRole === 'client_user') {
       const userClient = await getClientByUserId(userId);
       if (!userClient || userClient.id !== clientId) {
           return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
       }
       verifiedClientId = userClient.id;
    } else if (userRole !== 'admin') {
       // Ambassadors? Maybe, but for now let's restrict to Admin/Client
       return NextResponse.json({ error: 'Forbidden role' }, { status: 403 });
    }

    if (!verifiedClientId) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

    // 2. Manage Thread
    let threadId = existingThreadId;
    if (!threadId) {
       const newThread = await createAIThread(verifiedClientId, message.substring(0, 30) + '...', userId);
       threadId = newThread.id;
    }

    // 3. Save User Message
    await addAIMessage(threadId, 'user', message);

    // 4. Fetch Context
    const contextData = await getClientContextForAI(verifiedClientId);
    const contextString = JSON.stringify(contextData, null, 2);

    // 5. Fetch History (Last 10 messages)
    const history = await getAIMessages(threadId);
    const historyMessages = history.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
    }));

    // 6. Call Groq
    const systemPrompt = `You are an expert Operations Analyst for Klaroops.
    You are analyzing data for client: ${contextData?.client_name}.
    
    Current Data Context:
    ${contextString}
    
    Rules:
    - Answer strictly based on the provided context.
    - If data is missing, say "I don't have that data currently."
    - Be professional, concise, and helpful.
    - Do not make up numbers.
    `;

    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            ...historyMessages
        ],
        model: GROQ_MODELS.FAST,
        temperature: 0.5,
        max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || "I couldn't generate a response.";

    // 7. Save AI Response
    await addAIMessage(threadId, 'assistant', aiResponse);

    return NextResponse.json({ 
        response: aiResponse, 
        threadId: threadId 
    });

  } catch (e: any) {
    console.error('Chat API Error:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
