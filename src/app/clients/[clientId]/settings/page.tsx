import { getClient } from '@/lib/db';
import { notFound } from 'next/navigation';
import SettingsForm from '@/components/SettingsForm';

export default function SettingsPage({ params, searchParams }: { params: { clientId: string }, searchParams: { tenantId: string } }) {
  const tenantId = searchParams.tenantId;
  const client = getClient(tenantId, params.clientId);
  
  if (!client) {
    notFound();
  }

  return <SettingsForm client={client} tenantId={tenantId} />;
}
