'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Zap, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle2, 
  X,
  Send,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BarChart2,
  Filter
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea,
  BarChart, Bar, Cell, ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const SPREADSHEET_DATA = [
  ['Date', 'Project', 'Category', 'Vendor', 'Amount', 'Status'],
  ['2024-02-01', 'Site A', 'Concrete', 'ReadyMix Co', '$12,500', 'Paid'],
  ['2024-02-02', 'Site A', 'Steel', 'SteelCorp', '$45,000', 'Pending'],
  ['2024-02-02', 'Site B', 'Labor', 'Staff', '$8,200', 'Paid'],
  ['2024-02-03', 'Site A', 'Steel', 'SteelCorp', '$12,000', 'Pending'],
  ['2024-02-04', 'Site C', 'Lumber', 'WoodWorks', '$5,400', 'Paid'],
  ['2024-02-05', 'Site A', 'Steel', 'SteelCorp', '$28,000', 'Pending'],
  ['2024-02-06', 'Site B', 'Labor', 'Staff', '$8,400', 'Paid'],
  ['2024-02-07', 'Site A', 'Concrete', 'ReadyMix Co', '$11,000', 'Paid'],
  ['2024-02-08', 'Site C', 'Plumbing', 'PipeMasters', '$3,200', 'Pending'],
  ['2024-02-09', 'Site A', 'Steel', 'SteelCorp', '$15,000', 'Pending'],
  ['2024-02-10', 'Site B', 'Electrical', 'VoltTech', '$4,500', 'Paid'],
  ['2024-02-11', 'Site A', 'General', 'SupplyCo', '$1,200', 'Paid'],
  ['2024-02-12', 'Site C', 'Labor', 'Staff', '$6,000', 'Paid'],
];

const TREND_DATA = [
  { date: 'Feb 01', value: 45000 },
  { date: 'Feb 02', value: 48000 },
  { date: 'Feb 03', value: 47000 },
  { date: 'Feb 04', value: 52000 },
  { date: 'Feb 05', value: 51000 },
  { date: 'Feb 06', value: 78000 }, // Spike start
  { date: 'Feb 07', value: 85000 },
  { date: 'Feb 08', value: 82000 },
  { date: 'Feb 09', value: 79000 },
  { date: 'Feb 10', value: 81000 },
];

const COMPARISON_DATA = [
  { name: 'Previous Period', value: 32000 },
  { name: 'Current Period', value: 77000 }, // +45k
];

const CONTRIBUTION_DATA = [
  { name: 'Site A - Steel', value: 45000, fill: '#ef4444' }, // Primary
  { name: 'Site B - Labor', value: 8200, fill: '#94a3b8' },
  { name: 'Site C - Lumber', value: 5400, fill: '#cbd5e1' },
  { name: 'Other', value: 7600, fill: '#e2e8f0' },
];

const SCOPE_CHECKS = [
  { name: 'Site B Operations', status: 'Normal', color: 'text-green-600' },
  { name: 'Site C Operations', status: 'Normal', color: 'text-green-600' },
  { name: 'Labor Costs', status: 'Normal', color: 'text-green-600' },
  { name: 'Concrete Suppliers', status: 'Normal', color: 'text-green-600' },
  { name: 'General Overhead', status: 'Normal', color: 'text-green-600' },
];

const STEPS = [
  "Reading spreadsheet data...",
  "Normalizing columns and formats...",
  "Comparing latest vs previous period...",
  "Detecting significant anomalies...",
  "Generating actionable insights..."
];

export default function PublicDemoPage() {
  const [phase, setPhase] = useState<'input' | 'processing' | 'dashboard'>('input');
  const [currentStep, setCurrentStep] = useState(0);
  const [showChat, setShowChat] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: 'I analyzed the spreadsheet. The biggest finding is a 28% cost increase driven by steel orders at Site A. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const runDecisionEngine = () => {
    setPhase('processing');
    let step = 0;
    const interval = setInterval(() => {
        step++;
        if (step >= STEPS.length) {
            clearInterval(interval);
            setTimeout(() => setPhase('dashboard'), 800);
        } else {
            setCurrentStep(step);
        }
    }, 800);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
        let response = "This is a demo, but in the real app I would analyze your full history to answer that.";
        if (userMsg.toLowerCase().includes('why') || userMsg.toLowerCase().includes('steel')) {
            response = "The increase is due to 4 expedited orders from 'SteelCorp' between Feb 2-9, priced 15% above standard rates.";
        } else if (userMsg.toLowerCase().includes('action') || userMsg.toLowerCase().includes('do')) {
            response = "I recommend checking the original POs for Site A to confirm if these expedited fees were approved.";
        }
        setMessages(prev => [...prev, { role: 'ai', text: response }]);
        setTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 h-16 flex items-center px-4 md:px-8 justify-between shadow-sm">
         <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium transition text-sm">
                <ArrowLeft size={16} /> Back
            </Link>
            <div className="h-5 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 font-bold text-gray-900">
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <Zap size={18} />
                </div>
                <span>Decision Engine Demo</span>
            </div>
         </div>
         <Link href="/signup" className="bg-blue-700 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-800 transition shadow-md hover:-translate-y-0.5 text-sm">
            Start free trial
         </Link>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12">
         
         <AnimatePresence mode="wait">
            
            {/* === PHASE 1: INPUT DATA === */}
            {phase === 'input' && (
                <motion.div 
                    key="input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">Where it starts: Your Data</h1>
                        <p className="text-gray-500 text-lg">Klaroops takes your messy spreadsheets and turns them into decisions.</p>
                    </div>

                    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8 relative">
                        <div className="bg-green-50 border-b border-gray-200 p-3 flex items-center gap-3">
                            <FileSpreadsheet className="text-green-700" size={24} />
                            <span className="font-medium text-gray-700 text-sm">Demo Construction Co – Weekly Costs.xlsx</span>
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">Read Only</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="w-10 p-2 border-r border-b border-gray-200 text-center bg-gray-100"></th>
                                        {SPREADSHEET_DATA[0].map((h, i) => (
                                            <th key={i} className="p-2 border-r border-b border-gray-200 font-bold bg-gray-50 min-w-[100px]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {SPREADSHEET_DATA.slice(1).map((row, i) => (
                                        <tr key={i} className="hover:bg-blue-50/30">
                                            <td className="p-2 border-r border-b border-gray-200 text-center bg-gray-50 text-gray-400 text-xs">{i + 1}</td>
                                            {row.map((cell, j) => (
                                                <td key={j} className="p-2 border-r border-b border-gray-200 text-gray-700">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>

                    <button 
                        onClick={runDecisionEngine}
                        className="group bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-blue-800 transition hover:scale-105 flex items-center gap-3"
                    >
                        <Zap size={24} className="fill-yellow-400 text-yellow-400 group-hover:animate-pulse" />
                        Run Decision Engine
                    </button>
                    <p className="text-sm text-gray-400 mt-4">See how raw data becomes insight</p>
                </motion.div>
            )}

            {/* === PHASE 2: PROCESSING === */}
            {phase === 'processing' && (
                <motion.div 
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[500px]"
                >
                    <div className="w-full max-w-md space-y-6">
                        {STEPS.map((step, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ 
                                    opacity: i <= currentStep ? 1 : 0.3, 
                                    x: 0,
                                    scale: i === currentStep ? 1.05 : 1
                                }}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
                            >
                                <div className="shrink-0">
                                    {i < currentStep ? (
                                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                            <CheckCircle2 size={20} />
                                        </div>
                                    ) : i === currentStep ? (
                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                            <Loader2 size={20} className="animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                                    )}
                                </div>
                                <span className={`font-medium ${i === currentStep ? 'text-blue-900' : 'text-gray-600'}`}>{step}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* === PHASE 3: DECISION DASHBOARD (REDESIGNED) === */}
            {phase === 'dashboard' && (
                <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                >
                    
                    {/* LAYER 1: DECISION CARD */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                        <AlertTriangle size={12} /> Critical Warning
                                    </span>
                                    <span className="text-gray-400 text-sm">Detected Feb 12, 2024</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                                    Costs jumped abnormally last week.
                                </h1>
                                
                                <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Primary Cause</p>
                                        <p className="text-lg font-bold text-gray-900">Steel purchases in Site A</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Recommended Action</p>
                                        <p className="text-lg font-bold text-blue-700 flex items-center gap-2">
                                            Review expedited orders from SteelCorp <ArrowRight size={18} />
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="shrink-0 bg-red-50 p-8 rounded-2xl border border-red-100 text-center min-w-[200px]">
                                <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-2">Economic Impact</p>
                                <p className="text-5xl font-black text-red-600">+$45k</p>
                                <p className="text-sm text-red-400 font-medium mt-2">vs Previous Period</p>
                            </div>
                        </div>
                    </div>

                    {/* LAYER 2: PROOF CHARTS */}
                    <div className="grid md:grid-cols-3 gap-6">
                        
                        {/* Chart 1: Trend Context */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <TrendingUp size={18} className="text-blue-600" /> Spending Trend
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">Red area indicates outside normal behavior</p>
                            <div className="h-60 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={TREND_DATA}>
                                        <XAxis dataKey="date" hide />
                                        <YAxis hide domain={[40000, 90000]} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                                        />
                                        <ReferenceArea y1={40000} y2={60000} fill="#f1f5f9" />
                                        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
                                        <ReferenceLine x="Feb 06" stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Spike', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 2: Before vs After */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <BarChart2 size={18} className="text-blue-600" /> Site A Steel Costs
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">Previous vs Current Period Comparison</p>
                            <div className="h-60 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={COMPARISON_DATA} barSize={40}>
                                        <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                                        <YAxis hide />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {COMPARISON_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 1 ? '#ef4444' : '#cbd5e1'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Chart 3: Contribution */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Filter size={18} className="text-blue-600" /> Driver Breakdown
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">What makes up the +$45k variance?</p>
                            <div className="h-60 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={CONTRIBUTION_DATA} layout="vertical" barSize={20}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {CONTRIBUTION_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* LAYER 3: SYSTEM CONTEXT */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-slate-900 text-white p-8 rounded-2xl shadow-lg flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap size={20} className="text-yellow-400" />
                                <h3 className="font-bold text-lg">System Analysis</h3>
                            </div>
                            <p className="text-blue-100 leading-relaxed text-lg">
                                This spending pattern is <strong>highly unusual</strong> compared to the last 6 months. 
                                The spike correlates with 4 expedited orders from Vendor "SteelCorp" placed between Feb 2-9. 
                                Based on current run rates, this will cause a <strong>$120k budget overrun</strong> if not corrected this week.
                            </p>
                            <div className="mt-6">
                                <button 
                                    onClick={() => setShowChat(true)}
                                    className="text-white text-sm font-bold underline decoration-blue-500 decoration-2 underline-offset-4 hover:text-blue-200 transition"
                                >
                                    Ask Klaroops about these orders
                                </button>
                            </div>
                        </div>

                        {/* LAYER 4: SCOPE CONFIRMATION */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-green-600" /> Other Areas Checked
                            </h3>
                            <div className="space-y-3">
                                {SCOPE_CHECKS.map((check, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-600">{check.name}</span>
                                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            {check.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-8 pb-8">
                        <p className="text-gray-500 mb-4">Ready to run this on your own data?</p>
                        <Link href="/signup" className="inline-block bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition shadow-xl hover:-translate-y-1">
                            Start free trial
                        </Link>
                    </div>

                </motion.div>
            )}

         </AnimatePresence>

         {/* === PHASE 4: AI CHAT DRAWER === */}
         <AnimatePresence>
            {showChat && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowChat(false)}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                    >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-blue-900 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Klaroops AI</h3>
                                    <p className="text-xs text-blue-200">Demo Mode</p>
                                </div>
                            </div>
                            <button onClick={() => setShowChat(false)} className="text-white/70 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                        m.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                    }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {typing && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSend} className="relative">
                                <input 
                                    className="w-full bg-gray-100 border-0 rounded-xl px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ask a question..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                />
                                <button type="submit" className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    <Send size={16} />
                                </button>
                            </form>
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                <button onClick={() => setInput("Why did steel costs go up?")} className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-600 transition">
                                    Why did steel costs go up?
                                </button>
                                <button onClick={() => setInput("What action should I take?")} className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-600 transition">
                                    What action should I take?
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
         </AnimatePresence>

      </main>
    </div>
  );
}

function MessageSquareIcon(props: any) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            {...props}
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    )
}
