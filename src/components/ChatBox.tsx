'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

export default function ChatBox({ clientId }: { clientId: string }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hello. I can explain the metrics on this dashboard. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          clientId
        })
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message.content }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border flex flex-col h-[600px]">
      <div className="p-4 border-b flex items-center gap-2 bg-gray-50 rounded-t-lg">
        <Sparkles size={16} className="text-purple-600" />
        <h3 className="font-semibold text-sm">Metrics Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
              m.role === 'user' 
                ? 'bg-black text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 text-sm animate-pulse">
              Analyzing metrics...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the dashboard..."
          className="flex-1 text-sm border rounded-md px-3 py-2 focus:outline-none focus:border-black"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="bg-black text-white p-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
