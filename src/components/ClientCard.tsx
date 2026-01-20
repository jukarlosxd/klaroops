import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Client } from '@/lib/db';

export function ClientCard({ client }: { client: Client }) {
  return (
    <Link href={`/clients/${client.id}`} className="block group">
      <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {client.name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{client.template_id.replace('-', ' ')}</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${client.last_sync ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
        
        <div className="text-xs text-gray-400 mt-4">
          Last sync: {client.last_sync ? formatDistanceToNow(new Date(client.last_sync), { addSuffix: true }) : 'Never'}
        </div>
      </div>
    </Link>
  );
}
