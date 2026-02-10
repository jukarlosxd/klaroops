'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
  onFinish: () => void;
}

const STEPS = [
  {
    targetId: 'decision-sentence',
    title: 'The "What Changed" Summary',
    text: 'This sentence is the most important thing on the screen. It summarizes the biggest shift in your data so you don’t have to dig.',
    position: 'bottom'
  },
  {
    targetId: 'main-chart',
    title: 'The Context Chart',
    text: 'This shows when the change started. Look for spikes or dips that align with the summary above.',
    position: 'top'
  },
  {
    targetId: 'drivers-table',
    title: 'The Drivers',
    text: 'This explains WHY the change happened. We break down the total variance by project or category so you know where to act.',
    position: 'top'
  }
];

export default function DashboardTour({ onFinish }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      const element = document.getElementById(STEPS[currentStep].targetId);
      if (element) {
        setRect(element.getBoundingClientRect());
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Small delay to allow rendering
    const timer = setTimeout(updateRect, 500);
    window.addEventListener('resize', updateRect);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  if (!rect) return null;

  return (
    <div className="fixed inset-0 z-[50] overflow-hidden">
      {/* Dimmed Background with Cutout */}
      <div className="absolute inset-0 bg-black/60 mix-blend-multiply transition-all duration-500" />
      
      {/* Highlight Box */}
      <motion.div 
        className="absolute border-4 border-blue-400 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none transition-all duration-500 ease-in-out"
        style={{
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        }}
      />

      {/* Tooltip Card */}
      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-[60] bg-white rounded-xl shadow-2xl p-6 w-80 max-w-[90vw]"
        style={{
          top: STEPS[currentStep].position === 'bottom' 
            ? rect.bottom + 24 
            : rect.top - 200 > 0 ? rect.top - 200 : rect.bottom + 24, // Fallback if top is too tight
          left: Math.max(16, Math.min(window.innerWidth - 340, rect.left + (rect.width / 2) - 160)) // Center horizontally, clamp to screen
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900">{STEPS[currentStep].title}</h3>
          <button onClick={onFinish} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
        </div>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          {STEPS[currentStep].text}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
          </div>
          <button 
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
          >
            {currentStep === STEPS.length - 1 ? 'Got it' : 'Next'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
