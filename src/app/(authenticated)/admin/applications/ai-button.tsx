'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AiScoreButton({ id, hasScore }: { id: string, hasScore: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleScore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${id}/score`, {
        method: 'POST'
      });
      if (res.ok) {
        router.refresh(); // Refresh Server Components to show new score
      } else {
        alert('Failed to score application');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to AI Scoring');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
        onClick={handleScore}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 border ${
            hasScore 
            ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-sm'
        }`}
    >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {hasScore ? 'Re-Score AI' : 'Auto-Score AI'}
    </button>
  );
}
