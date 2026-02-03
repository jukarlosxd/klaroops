import { getClient } from '@/lib/db';
import Dashboard from '@/components/Dashboard/Dashboard';
import { notFound } from 'next/navigation';
import metricRegistry from '@/lib/schemas/metric-registry.schema.json';

// For now, we'll use a hardcoded tenantId.
// In a real app, this would come from the user's session.
export default function ClientPage({ params, searchParams }: { params: { clientId: string }, searchParams: { tenantId: string } }) {
  const tenantId = searchParams.tenantId || 'tnt_default';
  const client = getClient(tenantId, params.clientId);
  
  if (!client) {
    notFound();
  }

  return <Dashboard client={client} tenantId={tenantId} metricRegistry={metricRegistry} />;
}
