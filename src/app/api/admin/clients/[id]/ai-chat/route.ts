import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDashboardProject, getAIThreads, createAIThread, addAIMessage, getAIMessages } from '@/lib/admin-db';
import { chatWithData } from '@/lib/llm';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, thread_id } = await req.json();
    const clientId = params.id;
    const actorId = session.user?.email || 'admin';

    // 1. Get or Create Thread
    let threadId = thread_id;
    if (!threadId) {
        const newThread = await createAIThread(clientId, message.substring(0, 30) + '...', actorId);
        threadId = newThread.id;
    }

    // 2. Save User Message
    await addAIMessage(threadId, 'user', message);

    // 3. Gather Context
    const project = await getDashboardProject(clientId);
    const messages = await getAIMessages(threadId);
    
    // In a real app, we would fetch fresh headers/sample from the sheet again or cache it
    // For now, we use what's in the config or empty
    const context = {
        headers: project ? Object.values(JSON.parse(project.mapping_json || '{}')) as string[] : [],
        config: project,
        samples: [] // We don't persist samples in DB for privacy, would need to re-fetch or cache
    };

    // 4. Call LLM
    const responseContent = await chatWithData(context, messages);

    // 5. Save Assistant Message
    const aiMsg = await addAIMessage(threadId, 'assistant', responseContent || 'Sorry, I could not process that.');

    return NextResponse.json({ 
        message: aiMsg,
        thread_id: threadId
    });

  } catch (error: any) {
    console.error('Chat Error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
