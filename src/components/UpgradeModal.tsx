'use client';

import { useState } from 'react';
import { X, Check, Lock } from 'lucide-react';
import { PLANS } from '@/lib/entitlements';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  triggerReason?: string; // e.g., "History access limited"
}

export default function UpgradeModal({ isOpen, onClose, triggerReason }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        <div className="p-6 border-b flex justify-between items-start">
          <div>
             {triggerReason && (
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold mb-3 border border-yellow-100">
                 <Lock size={12} /> {triggerReason}
               </div>
             )}
             <h2 className="text-2xl font-bold text-gray-900">Upgrade your plan</h2>
             <p className="text-gray-500">Get more clarity, history, and automated alerts.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 grid md:grid-cols-3 gap-6 bg-gray-50">
           {/* Starter */}
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition">
              <h3 className="font-bold text-lg mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-4">$15<span className="text-sm text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-3 mb-6 text-sm text-gray-600">
                 <li className="flex gap-2"><Check size={16} className="text-blue-500" /> 14-day history</li>
                 <li className="flex gap-2"><Check size={16} className="text-blue-500" /> 1 Active Dataset</li>
                 <li className="flex gap-2"><Check size={16} className="text-blue-500" /> Weekly Summary</li>
              </ul>
              <button className="w-full py-2 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50">Select Starter</button>
           </div>

           {/* Growth */}
           <div className="bg-white p-6 rounded-xl border-2 border-blue-600 shadow-lg transform scale-105 relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
              <h3 className="font-bold text-lg mb-2">Growth</h3>
              <div className="text-3xl font-bold mb-4">$29<span className="text-sm text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-3 mb-6 text-sm text-gray-600">
                 <li className="flex gap-2"><Check size={16} className="text-blue-600" /> 90-day history</li>
                 <li className="flex gap-2"><Check size={16} className="text-blue-600" /> 5 Datasets</li>
                 <li className="flex gap-2"><Check size={16} className="text-blue-600" /> Daily Alerts</li>
                 <li className="flex gap-2"><Check size={16} className="text-blue-600" /> AI Insights</li>
              </ul>
              <button className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">Select Growth</button>
           </div>

           {/* Pro */}
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition">
              <h3 className="font-bold text-lg mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-4">$49<span className="text-sm text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-3 mb-6 text-sm text-gray-600">
                 <li className="flex gap-2"><Check size={16} className="text-blue-500" /> 1-year history</li>
                 <li className="flex gap-2"><Check size={16} className="text-blue-500" /> 20 Datasets</li>
                 <li className="flex gap-2"><Check size={16} className="text-blue-500" /> Real-time Alerts</li>
                 <li className="flex gap-2"><Check size={16} className="text-blue-500" /> Priority Support</li>
              </ul>
              <button className="w-full py-2 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50">Select Pro</button>
           </div>
        </div>
        
        <div className="p-4 text-center text-xs text-gray-400 bg-white rounded-b-2xl">
           Secure payment via Stripe. Cancel anytime.
        </div>
      </div>
    </div>
  );
}
