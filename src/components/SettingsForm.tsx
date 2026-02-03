'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Client } from '@/types/client';
import Link from 'next/link';
import { ArrowLeft, Trash2, Save } from 'lucide-react';

interface SettingsFormProps {
  client: Client;
  tenantId: string;
}

export default function SettingsForm({ client, tenantId }: SettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: client.name,
    spreadsheetId: client.config.metadata.spreadsheetId ?? ''
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await fetch('/api/clients', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: tenantId,
        id: client.id,
        name: formData.name,
        config: {
          ...client.config,
          metadata: {
            ...client.config.metadata,
            spreadsheetId: formData.spreadsheetId,
          },
        },
      }),
    });
    
    setLoading(false);
    router.refresh();
    router.push(`/clients/${client.id}?tenantId=${tenantId}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This cannot be undone.')) return;
    
    setDeleting(true);
    await fetch(`/api/clients?tenantId=${tenantId}&id=${client.id}`, {
      method: 'DELETE'
    });
    
    router.push(`/clients?tenantId=${tenantId}`);
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href={`/clients/${client.id}?tenantId=${tenantId}`} className="flex items-center gap-2 text-gray-500 hover:text-black mb-4">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Client Settings</h1>
        <p className="text-gray-500">Manage configuration for {client.name}</p>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Spreadsheet ID</label>
            <input 
              type="text" 
              value={formData.spreadsheetId}
              onChange={(e) => setFormData({...formData, spreadsheetId: e.target.value})}
              className="w-full p-2 border rounded-md font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for data synchronization. Ensure the service account has access.
            </p>
          </div>

          <div className="pt-4 flex justify-between items-center border-t mt-6">
            <button 
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting...' : 'Delete Client'}
            </button>

            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
