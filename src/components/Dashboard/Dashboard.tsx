'use client';

import { useState, useEffect } from 'react';
import { Client } from '@/lib/db';
import { Metrics } from '@/lib/metrics';
import { KPICard } from './KPICard';
import { Charts } from './Charts';
import { BrokenTable } from './BrokenTable';
import ChatBox from '@/components/ChatBox';
import { RefreshCw, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard({ client }: { client: Client }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchMetrics = async () => {
    const res = await fetch(`/api/metrics?clientId=${client.id}`);
    const data = await res.json();
    setMetrics(data);
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ clientId: client.id })
    });
    await fetchMetrics();
    setSyncing(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, [client.id]);

  if (loading || !metrics) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-gray-500 mt-1">Ops Walkthrough Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-white border px-3 py-2 rounded-md text-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
          <Link href={`/clients/${client.id}/settings`} className="p-2 border rounded-md bg-white hover:bg-gray-50">
            <Settings size={20} className="text-gray-500" />
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Availability (Today)" value={`${metrics.availabilityToday}%`} trend="neutral" />
        <KPICard title="Downtime Incidents" value={metrics.downtimeCount} trend="bad" />
        <KPICard title="Broken Assets" value={metrics.brokenCount} trend={metrics.brokenCount > 0 ? 'bad' : 'good'} />
        <KPICard title="Total Assets" value={metrics.totalAssets} trend="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          <Charts metrics={metrics} />
          <BrokenTable assets={metrics.brokenAssets} />
        </div>

        {/* Sidebar (1 col) - Chat */}
        <div className="lg:col-span-1">
          <ChatBox clientId={client.id} />
        </div>
      </div>
    </div>
  );
}
