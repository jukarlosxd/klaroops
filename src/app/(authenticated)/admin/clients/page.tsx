import { getClients, getAmbassadors } from '@/lib/admin-db';
import ClientsClient from './client';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  try {
    const clients = (await getClients()) || [];
    const ambassadors = (await getAmbassadors()) || [];

    return (
      <ClientsClient 
        clients={clients} 
        ambassadors={ambassadors} 
      />
    );
  } catch (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading clients.
      </div>
    );
  }
}
