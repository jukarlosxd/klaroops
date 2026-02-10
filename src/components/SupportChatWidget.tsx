'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, Phone } from 'lucide-react';

import { supportConfig } from '@/config/support';

interface SupportChatWidgetProps {
  // Config can be passed in or use defaults
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function SupportChatWidget({}: SupportChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I'm KlaroOps Support. How can I help you today? \n\nHola! Soy el soporte de KlaroOps. ¿En qué puedo ayudarte hoy?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
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
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'system', content: 'Connection error. Please try again or contact support manually.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
          {/* Header */}
          <div className="bg-slate-900 p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-slate-800">
                    <Bot size={20} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm">KlaroOps Support</h3>
                <p className="text-xs text-slate-400">AI Assistant • EN/ES</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-slate-600" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[85%] p-3 text-sm rounded-2xl shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : m.role === 'system'
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                 <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-slate-600" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="text-blue-500 animate-spin" />
                    <span className="text-xs text-gray-500 font-medium">Checking knowledge base...</span>
                  </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="relative flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 pl-4 pr-10 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm transition-all outline-none"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-center mt-2 flex justify-between items-center px-1">
               <p className="text-[10px] text-gray-400">Powered by KlaroOps AI</p>
               <a href={`tel:${supportConfig.phoneNumber.replace(/\s/g, '')}`} className="text-[10px] text-blue-500 flex items-center gap-1 font-medium hover:underline">
                 <Phone size={10} /> Call Human
               </a>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen 
            ? 'bg-slate-800 text-white rotate-90' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
