'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react';

interface ChatWidgetProps {
  clientId: string;
  clientName: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
}

export default function ChatWidget({ clientId, clientName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I'm your KlaroOps Assistant. I can answer questions about your data at ${clientName}. How can I help?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          clientId,
          threadId
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      if (data.threadId) setThreadId(data.threadId);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'system', content: 'Sorry, I encountered an error connecting to the AI. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <h3 className="font-semibold text-sm">KlaroOps AI</h3>
                <p className="text-xs opacity-80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online • Groq Powered
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
          >
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
                    {m.role === 'system' ? <span className="text-xs">⚠️</span> : <Bot size={14} className="text-indigo-600" />}
                  </div>
                )}
                
                <div 
                  className={`max-w-[80%] p-3 text-sm rounded-2xl shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : m.role === 'system'
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                    <User size={14} className="text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
                    <Bot size={14} className="text-indigo-600" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="text-indigo-500 animate-spin" />
                    <span className="text-xs text-gray-500 font-medium">Thinking...</span>
                  </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your dashboard..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm transition-all outline-none"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-center mt-2">
               <p className="text-[10px] text-gray-400">AI can make mistakes. Verify important data.</p>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-gray-800 text-white rotate-90' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white animate-bounce-subtle'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
