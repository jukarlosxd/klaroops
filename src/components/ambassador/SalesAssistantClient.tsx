'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Plus, 
  MessageSquare, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Trash2, 
  Edit,
  ChevronRight
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  industry: string;
  status: string;
  notes: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SalesAssistantClient() {
  const { t, lang } = useLanguage();
  
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      name: '',
      company: '',
      industry: '',
      notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      loadLeads();
  }, []);

  const loadLeads = async () => {
      try {
          const res = await fetch('/api/ambassador/leads');
          if (res.ok) {
              const data = await res.json();
              setLeads(data);
          }
      } catch (e) { console.error(e); }
  };

  const handleSaveLead = async () => {
      if (!formData.name || !formData.company) return;
      setLoading(true);
      try {
          const res = await fetch('/api/ambassador/leads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });
          if (res.ok) {
              setShowAddModal(false);
              setFormData({ name: '', company: '', industry: '', notes: '' });
              loadLeads();
          }
      } catch (e) { alert('Error saving lead'); }
      setLoading(false);
  };

  const handleDeleteLead = async (id: string, e: any) => {
      e.stopPropagation();
      if (!confirm('Delete lead?')) return;
      try {
          await fetch(`/api/ambassador/leads/${id}`, { method: 'DELETE' });
          if (selectedLead?.id === id) setSelectedLead(null);
          loadLeads();
      } catch (e) { console.error(e); }
  };

  const handleSendMessage = async () => {
      if (!input.trim()) return;
      const msg = input;
      setInput('');
      setMessages(prev => [...prev, { role: 'user', content: msg }]);
      setChatLoading(true);

      try {
          const res = await fetch('/api/ambassador/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  message: msg, 
                  leadId: selectedLead?.id,
                  language: lang
              })
          });
          const data = await res.json();
          setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } catch (e) {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing message.' }]);
      }
      setChatLoading(false);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      
      {/* LEFT: LEADS TRACKER */}
      <div className="w-1/3 bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">{t.salesAssistant.leads}</h2>
            <button 
                onClick={() => setShowAddModal(true)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                <Plus size={18} />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {leads.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">
                    No leads yet. Add one to start tracking.
                </div>
            )}
            {leads.map(lead => (
                <div 
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-3 rounded-lg border cursor-pointer transition relative group ${
                        selectedLead?.id === lead.id 
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' 
                        : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900">{lead.name}</h3>
                            <p className="text-xs text-gray-500">{lead.company}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium
                            ${lead.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                              lead.status === 'closed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                        `}>
                            {t.salesAssistant.status[lead.status as keyof typeof t.salesAssistant.status] || lead.status}
                        </span>
                    </div>
                    <button 
                        onClick={(e) => handleDeleteLead(lead.id, e)}
                        className="absolute right-2 bottom-2 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
        </div>
      </div>

      {/* RIGHT: AI COACH */}
      <div className="w-2/3 bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-purple-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Bot className="text-purple-600" />
                <div>
                    <h2 className="font-bold text-purple-900">{t.salesAssistant.chatTitle}</h2>
                    <p className="text-xs text-purple-700">
                        {selectedLead 
                            ? `${t.salesAssistant.leadContext} ${selectedLead.name} (${selectedLead.company})` 
                            : t.salesAssistant.noContext}
                    </p>
                </div>
            </div>
            {selectedLead && (
                <button onClick={() => setSelectedLead(null)} className="text-xs text-purple-600 hover:underline">
                    Clear Context
                </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Bot size={48} className="mb-4 opacity-20" />
                    <p>{t.salesAssistant.emptyChat}</p>
                </div>
            )}
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                    }`}>
                        {msg.content}
                    </div>
                </div>
            ))}
            {chatLoading && (
                <div className="flex justify-start">
                    <div className="bg-white border px-4 py-2 rounded-lg rounded-bl-none shadow-sm">
                        <Loader2 size={16} className="animate-spin text-purple-600" />
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 bg-white border-t flex gap-2">
            <input 
                className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder={t.salesAssistant.chatPlaceholder}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                disabled={chatLoading}
            />
            <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || chatLoading}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
            >
                <Send size={20} />
            </button>
        </div>
      </div>

      {/* ADD LEAD MODAL */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                  <h3 className="text-lg font-bold mb-4">{t.salesAssistant.addLead}</h3>
                  <div className="space-y-3">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">{t.salesAssistant.form.name}</label>
                          <input 
                              className="w-full border rounded p-2" 
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">{t.salesAssistant.form.company}</label>
                          <input 
                              className="w-full border rounded p-2" 
                              value={formData.company}
                              onChange={e => setFormData({...formData, company: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">{t.salesAssistant.form.industry}</label>
                          <input 
                              className="w-full border rounded p-2" 
                              value={formData.industry}
                              onChange={e => setFormData({...formData, industry: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase">{t.salesAssistant.form.notes}</label>
                          <textarea 
                              className="w-full border rounded p-2 h-20" 
                              value={formData.notes}
                              onChange={e => setFormData({...formData, notes: e.target.value})}
                          />
                      </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                      <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                      <button onClick={handleSaveLead} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded font-medium">
                          {loading ? 'Saving...' : t.salesAssistant.form.save}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
