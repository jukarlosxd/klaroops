'use client';

import { useLanguage } from "@/context/LanguageContext";
import { Users, DollarSign, Target, TrendingUp, Clock } from 'lucide-react';

interface Props {
  kpis: {
    activeClients: number;
    totalLeads: number;
    conversionRate: number;
    totalCommissions: number;
  };
  recentActivity: any[];
}

export default function DashboardClient({ kpis, recentActivity }: Props) {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t.dashboard.title}</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">{t.dashboard.activeClients}</p>
              <h3 className="text-3xl font-bold mt-1">{kpis.activeClients}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">{t.dashboard.commissions}</p>
              <h3 className="text-3xl font-bold mt-1 text-green-600">
                ${kpis.totalCommissions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">{t.dashboard.totalLeads}</p>
              <h3 className="text-3xl font-bold mt-1">{kpis.totalLeads}</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Target size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">{t.dashboard.conversionRate}</p>
              <h3 className="text-3xl font-bold mt-1">{kpis.conversionRate}%</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock size={20} />
            {t.dashboard.recentActivity}
          </h2>
        </div>
        <div className="divide-y">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t.dashboard.noActivity}</div>
          ) : (
            recentActivity.map((event) => (
              <div key={event.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  event.type === 'success' ? 'bg-green-500' : 
                  event.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleDateString()} {new Date(event.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
