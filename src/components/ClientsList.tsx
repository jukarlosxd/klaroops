'use client';

import { useState } from 'react';
import type { Client } from '@/types/client';
import { ClientCard } from '@/components/ClientCard';
import CreateClientModal from '@/components/CreateClientModal';
import { Plus } from 'lucide-react';

interface ClientsListProps {
  clients: Client[];
  tenantId: string;
}

export default function ClientsList({ clients, tenantId }: ClientsListProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Create new client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">No clients yet.</p>
          <button onClick={() => setModalOpen(true)} className="text-blue-600 hover:underline">
            Create your first client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
            <ClientCard key={client.id} client={client} tenantId={tenantId} />
          ))}
        </div>
      )}
      
      <CreateClientModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} tenantId={tenantId} />
    </div>
  );
}