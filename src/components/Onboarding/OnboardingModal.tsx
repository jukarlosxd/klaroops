'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, ArrowRight, CheckCircle2, BarChart3 } from 'lucide-react';

interface Props {
  onComplete: (mode: 'demo' | 'upload') => void;
}

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState<'welcome' | 'explainer'>('welcome');
  const [mode, setMode] = useState<'demo' | 'upload'>('demo');

  const handleChoice = (selectedMode: 'demo' | 'upload') => {
    setMode(selectedMode);
    setStep('explainer');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                <Sparkles size={32} />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                In 2 minutes, you’ll see what changed in your numbers.
              </h1>
              <p className="text-lg text-gray-500 mb-10 max-w-lg mx-auto">
                Klaroops is a decision assistant. We don't just show charts—we tell you where to look.
              </p>

              <div className="grid md:grid-cols-2 gap-4 max-w-lg mx-auto">
                <button 
                  onClick={() => handleChoice('demo')}
                  className="group relative p-6 border-2 border-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-lg transition text-left"
                >
                  <div className="flex items-center gap-3 font-bold text-blue-900 mb-2">
                    <BarChart3 size={20} /> Use Demo Data
                  </div>
                  <p className="text-sm text-blue-700 opacity-80">
                    See a fully populated dashboard instantly. Best for exploring.
                  </p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition text-blue-600">
                    <ArrowRight size={20} />
                  </div>
                </button>

                <button 
                  onClick={() => handleChoice('upload')}
                  className="group relative p-6 border-2 border-gray-200 bg-white rounded-xl hover:border-gray-300 hover:shadow-lg transition text-left"
                >
                  <div className="flex items-center gap-3 font-bold text-gray-900 mb-2">
                    <Upload size={20} /> Upload My Data
                  </div>
                  <p className="text-sm text-gray-500">
                    Connect a CSV or Excel file. Best if you have data ready.
                  </p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition text-gray-400">
                    <ArrowRight size={20} />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'explainer' && (
          <motion.div 
            key="explainer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Here’s what Klaroops does:</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0 font-bold">1</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Compares Periods</h3>
                    <p className="text-sm text-gray-500">Automatically checks your latest data against the previous period.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0 font-bold">2</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Detects Changes</h3>
                    <p className="text-sm text-gray-500">Highlights the single most important shift in your numbers.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0 font-bold">3</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Directs Action</h3>
                    <p className="text-sm text-gray-500">Shows you exactly which segment or project drove the change.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onComplete(mode)}
                className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                Show Me <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
