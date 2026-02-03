import { getAdminStats } from '@/lib/ambassador-db';
import { Users, DollarSign, Target, TrendingUp, AlertCircle, Briefcase } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const stats = getAdminStats();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-500">System Overview</p>
        </div>
        <div className="flex gap-2">
           <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400">System Healthy</span>
        </div>
      </div>
      
      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Ambassadors</p>
              <h3 className="text-3xl font-bold mt-1 text-gray-900">{stats.totalAmbassadors}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Briefcase size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Clients</p>
              <h3 className="text-3xl font-bold mt-1 text-gray-900">{stats.totalClients}</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Leads (Month)</p>
              <h3 className="text-3xl font-bold mt-1 text-gray-900">{stats.leadsThisMonth}</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Target size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Commissions</p>
              <h3 className="text-3xl font-bold mt-1 text-red-600">
                ${stats.pendingCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-500" />
            <h2 className="font-semibold text-gray-900">System Alerts</h2>
        </div>
        <div className="divide-y">
            {/* Mock Alerts for now - will be connected to real checks later */}
            <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">No active ambassadors found. Invite your first ambassador.</span>
                </div>
                <button className="text-blue-600 text-sm font-medium hover:underline">Fix</button>
            </div>
        </div>
      </div>

      {/* Modules Grid */}
      <h2 className="text-lg font-bold mb-4">Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <Users size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Ambassadors</h3>
            <p className="text-sm text-gray-500">Manage profiles, assign clients, and track performance.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                <Briefcase size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Clients</h3>
            <p className="text-sm text-gray-500">Global client list, dashboard status, and metrics.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Factory</h3>
            <p className="text-sm text-gray-500">Dashboard Builder Wizard. Create new tenant environments.</p>
        </div>
      </div>

    </div>
  );
}
