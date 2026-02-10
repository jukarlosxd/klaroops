'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChangeDetectionDashboard from '@/components/Dashboard/ChangeDetectionDashboard';
import Link from 'next/link';
import { Plus, BarChart3, Layout } from 'lucide-react';
import OnboardingModal from '@/components/Onboarding/OnboardingModal';
import DashboardTour from '@/components/Onboarding/DashboardTour';

interface Props {
  project: any;
  client: any;
}

export default function DashboardClient({ project, client }: Props) {
  const router = useRouter();
  const [showTour, setShowTour] = useState(client.onboarding_status === 'onboarding');
  const [showWelcome, setShowWelcome] = useState(client.onboarding_status === 'new');

  const handleOnboardingComplete = async (mode: 'demo' | 'upload') => {
    if (mode === 'demo') {
        // Create Demo Project
        await fetch('/api/dashboard/demo', { method: 'POST' });
        router.refresh();
        setShowWelcome(false);
        // The API sets status to 'onboarding', so after refresh, showTour becomes true automatically via props
        // But to be instant:
        setShowTour(true);
    } else {
        router.push('/dashboard/new');
    }
  };

  const handleTourFinish = async () => {
      setShowTour(false);
      // Advance to 'live'
      await fetch('/api/client/onboarding', { 
          method: 'POST', 
          body: JSON.stringify({ status: 'live' }) 
      });
      router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      
      {/* Onboarding Overlays */}
      {showWelcome && <OnboardingModal onComplete={handleOnboardingComplete} />}
      {showTour && <DashboardTour onFinish={handleTourFinish} />}

      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
           <p className="text-gray-500">
             {project 
               ? `Monitoring: ${JSON.parse(project.data_source_config_json || '{}').fileName || 'Dataset'}` 
               : 'Welcome to your command center.'}
           </p>
        </div>
        {project && (
           <Link 
             href="/dashboard/new" 
             className="text-sm text-gray-500 hover:text-blue-600 font-medium"
           >
             Replace Dataset
           </Link>
        )}
      </div>

      {/* Content */}
      {project ? (
        <ChangeDetectionDashboard project={project} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
       <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 size={40} />
       </div>
       <h2 className="text-2xl font-bold text-gray-900 mb-2">No Dashboard Configured</h2>
       <p className="text-gray-500 max-w-md mx-auto mb-8">
         Upload your spreadsheets to automatically generate a change detection dashboard. No complex setup required.
       </p>
       <Link 
         href="/dashboard/new" 
         className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-xl transition hover:-translate-y-1"
       >
         <Plus size={24} /> Create Dashboard
       </Link>
       
       <div className="mt-8 pt-8 border-t border-gray-100 flex justify-center gap-8 text-sm text-gray-400">
          <span className="flex items-center gap-2"><Layout size={16} /> Auto-Generated Layout</span>
          <span className="flex items-center gap-2"><BarChart3 size={16} /> Instant Change Detection</span>
       </div>
    </div>
  );
}
