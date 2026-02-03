import { getClientsByAmbassador } from '@/lib/admin-db';
import { getAmbassadorByUserId } from '@/lib/admin-db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Search, Filter, MoreHorizontal, UserPlus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AmbassadorClientsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return redirect('/login');
  }

  // If admin, redirect to admin clients
  if (session.user.role === 'admin') {
     return redirect('/admin/clients');
  }

  const ambassador = await getAmbassadorByUserId(session.user.id);
  
  if (!ambassador) {
    return <div className="p-8 text-center">Ambassador profile not found.</div>;
  }

  const clients = await getClientsByAmbassador(ambassador.id) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">My Clients</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search my clients..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              <th className="px-6 py-4 font-semibold text-gray-700">Contract Summary</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No clients assigned yet.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition">
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
                        <div className="text-[10px] text-blue-600 font-bold uppercase mt-1">
                            {client.onboarding_status}
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-gray-700 capitalize">
                            {client.contract_type || 'Monthly'}
                        </span>
                        {client.contract_value_cents && (
                            <span className="text-xs text-gray-500">
                                ${(client.contract_value_cents / 100).toLocaleString()}
                            </span>
                        )}
                        <span className="text-[10px] text-gray-400 capitalize">
                            Cycle: {client.billing_cycle || 'monthly'}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(client.last_activity_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
