import Link from 'next/link';
import { getClients } from '@/lib/db';
import { ClientCard } from '@/components/ClientCard';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ClientsPage() {
  const clients = getClients();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link 
          href="/clients/new" 
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Create new client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">No clients yet.</p>
          <Link href="/clients/new" className="text-blue-600 hover:underline">
            Create your first client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
