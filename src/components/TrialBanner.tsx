'use client';

import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface Props {
  trialEndsAt?: string;
  isExpired?: boolean;
}

export default function TrialBanner({ trialEndsAt, isExpired }: Props) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  if (isExpired) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 shadow-md relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold">Trial Expired</span>
            <span className="text-sm opacity-90">Your free trial has ended. Please upgrade to continue accessing your full data.</span>
          </div>
          <Link href="/settings/billing" className="bg-white text-red-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-100 transition">
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  const daysLeft = trialEndsAt 
    ? Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;

  return (
    <div className="bg-blue-600 text-white px-4 py-2 shadow-sm relative z-50 animate-in slide-in-from-top-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-yellow-300" />
          <span className="font-medium">Free Trial Active</span>
          <span className="opacity-80 hidden sm:inline">• {daysLeft} days remaining</span>
          <span className="opacity-80 hidden md:inline">• Upgrade anytime for full history & alerts.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/settings/billing" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-xs font-bold transition">
            View Plans
          </Link>
          <button onClick={() => setVisible(false)} className="opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
