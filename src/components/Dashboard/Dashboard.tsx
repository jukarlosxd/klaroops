'use client';

import { useState, useEffect } from 'react';
import type { Client } from '@/types/client';
import { Metrics } from '@/lib/metrics';
import { KPICard } from './KPICard';
import { Charts } from './Charts';
import { BrokenTable } from './BrokenTable';
import ChatBox from '@/components/ChatBox';
import { RefreshCw, Settings } from 'lucide-react';
import Link from 'next/link';
import SetupAssistant from './SetupAssistant'; // Make sure this is imported

// The new props for our dynamic dashboard
interface DashboardProps {
  client: Client;
  tenantId: string;
  metricRegistry: any; // Using 'any' for now, but this should have a proper type
}

export default function Dashboard({ client, tenantId, metricRegistry }: DashboardProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    const res = await fetch(`/api/metrics?clientId=${client.id}&tenantId=${tenantId}`);
    const data = await res.json();
    setMetrics(data);
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ clientId: client.id, tenantId: tenantId })
    });
    await fetchMetrics();
    setSyncing(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, [client.id, tenantId]);

  // If the template is 'from-scratch', show the setup assistant.
  if (client.config.templateId === 'from-scratch') {
    return <SetupAssistant client={client} tenantId={tenantId} />;
  }

  if (loading || !metrics) return <div className="p-8 text-center">Loading dashboard...</div>;

  // Find the template definition from the registry (for the title)
  const templateInfo = metricRegistry.templates.find((t: any) => t.id === client.config.templateId);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-gray-500 mt-1">{templateInfo?.name || 'Dashboard'}</p>
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
          <Link href={`/clients/${client.id}/settings?tenantId=${tenantId}`} className="p-2 border rounded-md bg-white hover:bg-gray-50">
            <Settings size={20} className="text-gray-500" />
          </Link>
        </div>
      </div>

      {/* KPIs - Rendered dynamically based on client config and metric registry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {client.config.dashboard.metricIds.map(metricId => {
          const metricDef = metricRegistry.metrics.find((m: any) => m.metricId === metricId);
          if (!metricDef) {
            console.warn(`Metric with ID '${metricId}' not found in registry.`);
            return null; // Or render a placeholder
          }

          // The key to get the value from the /api/metrics response
          const metricValueKey = metricDef.metricId; // Use metricId as the key
          const value = metrics[metricValueKey] ?? '--';

          return (
            <KPICard 
              key={metricId} 
              title={metricDef.labels.en} // Use the english label for now
              value={String(value)} 
              trend="neutral" // Trend calculation would be a future step
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          <Charts metrics={metrics} />
          <BrokenTable assets={metrics.brokenAssets} />
        </div>

        {/* Sidebar (1 col) - Chat */}
        <div className="lg:col-span-1">
          <ChatBox clientId={client.id} tenantId={tenantId} />
        </div>
      </div>
    </div>
  );
}
