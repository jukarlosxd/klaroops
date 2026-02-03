import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Client } from '@/types/client';
import { Settings } from 'lucide-react';

export function ClientCard({ client, tenantId }: { client: Client, tenantId: string }) {
  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow group">
      <Link href={`/clients/${client.id}?tenantId=${tenantId}`} className="block">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {client.name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{client.config.templateId.replace('-', ' ')}</p>
          </div>
        </div>
      </Link>
      <div className="border-t mt-4 pt-4 flex justify-end">
        <Link href={`/clients/${client.id}/settings?tenantId=${tenantId}`} className="text-gray-400 hover:text-gray-600">
          <Settings size={16} />
        </Link>
      </div>
    </div>
  );
}
