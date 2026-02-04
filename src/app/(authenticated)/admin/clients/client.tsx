'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Check, 
  AlertTriangle,
  FileText,
  Activity,
  LayoutDashboard,
  Bot
} from 'lucide-react';
import { Client, Ambassador } from '@/types/admin';
import CreateClientWizard from './create-wizard';

interface ClientsClientProps {
  clients: Client[];
  ambassadors: Ambassador[];
}

export default function ClientsClient({ clients, ambassadors }: ClientsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  // Map for quick lookup
  const safeAmbassadors = Array.isArray(ambassadors) ? ambassadors : [];
  const ambMap = new Map(safeAmbassadors.map(a => [a.id, a]));

  const safeClients = Array.isArray(clients) ? clients : [];
  const filteredClients = safeClients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.legal_name && c.legal_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Clients Management</h1>
           <p className="text-sm text-gray-500 mt-1">Manage client contracts, assignments, and dashboard configurations.</p>
        </div>
        <button 
          onClick={() => setShowCreateWizard(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-medium"
        >
          <UserPlus size={18} />
          Create Client
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 text-gray-600">
            <Filter size={18} />
            Status
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Client Name</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Ambassador</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Contract</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Dashboard</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No clients found.
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => {
                const amb = client.ambassador_id ? ambMap.get(client.ambassador_id) : null;
                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{client.name}</div>
                      {client.industry && <div className="text-xs text-gray-500">{client.industry}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${client.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        ${client.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${client.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {client.status}
                      </span>
                      {client.onboarding_status && client.onboarding_status !== 'live' && (
                         <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-wide border border-blue-100">
                           {client.onboarding_status}
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {amb ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {amb.name.charAt(0)}
                          </div>
                          <span className="text-gray-700">{amb.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs flex items-center gap-1">
                            <AlertTriangle size={12} /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                         {client.contract_value_cents ? (
                            <div className="flex flex-col">
                                <span className="text-gray-900 font-medium">
                                    ${(client.contract_value_cents / 100).toLocaleString()} 
                                    <span className="text-gray-400 text-xs font-normal ml-1">
                                        {client.contract_currency || 'USD'}
                                    </span>
                                </span>
                                <span className="text-xs text-gray-500 capitalize">{client.contract_type || 'monthly'}</span>
                            </div>
                         ) : (
                            <span className="text-gray-400 text-xs">-</span>
                         )}
                    </td>
                    <td className="px-6 py-4">
                         {/* Placeholder for dashboard status, will integrate real status later */}
                         <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                            <LayoutDashboard size={12} /> Not Configured
                         </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Details"
                         >
                            <FileText size={16} />
                         </button>
                         <button 
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="AI Assistant"
                         >
                            <Bot size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showCreateWizard && (
        <CreateClientWizard 
            ambassadors={ambassadors} 
            onClose={() => setShowCreateWizard(false)} 
            onSuccess={() => {
                setShowCreateWizard(false);
                router.refresh();
            }}
        />
      )}
    </div>
  );
}
