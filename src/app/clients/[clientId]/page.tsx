import { getClient } from '@/lib/db';
import Dashboard from '@/components/Dashboard/Dashboard';
import { notFound } from 'next/navigation';

export default function ClientPage({ params }: { params: { clientId: string } }) {
  const client = getClient(params.clientId);
  
  if (!client) {
    notFound();
  }

  return <Dashboard client={client} />;
}
