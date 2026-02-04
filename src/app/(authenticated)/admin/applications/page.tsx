import { getAmbassadorApplications, updateAmbassadorApplicationStatus, getAmbassadorApplicationStats } from '@/lib/admin-db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Calendar as CalendarIcon
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage({ searchParams }: { searchParams: { q?: string, status?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const stats = await getAmbassadorApplicationStats();
  const allApplications = await getAmbassadorApplications();

  // Filter Logic
  let filteredApps = [...allApplications];
  
  if (searchParams.status && searchParams.status !== 'all') {
      filteredApps = filteredApps.filter(a => a.status === searchParams.status);
  }

  if (searchParams.q) {
      const q = searchParams.q.toLowerCase();
      filteredApps = filteredApps.filter(a => 
          a.full_name.toLowerCase().includes(q) || 
          a.email.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q)
      );
  }

  // Sort by newest first
  const sortedApps = filteredApps.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  async function updateStatus(id: string, status: any) {
    'use server';
    const session = await getServerSession(authOptions);
    if (!session) return;
    await updateAmbassadorApplicationStatus(id, status, (session.user as any).id);
    revalidatePath('/admin/applications');
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header & KPIs */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Ambassador Applications</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard 
                title="New Today" 
                value={stats.newToday} 
                subValue={`${stats.deltaToday >= 0 ? '+' : ''}${stats.deltaToday} vs yesterday`}
                trend={stats.deltaToday >= 0 ? 'up' : 'down'}
            />
            <KpiCard 
                title="Last 7 Days" 
                value={stats.totalLast7Days} 
                subValue={`${stats.deltaWeeklyPercent}% vs prev week`}
                trend={stats.deltaWeekly >= 0 ? 'up' : 'down'}
            />
            <KpiCard 
                title="Pending Review" 
                value={stats.totalNew} 
                subValue="Needs action"
                trend="neutral"
                color="blue"
            />
            <KpiCard 
                title="Total Applications" 
                value={allApplications.length} 
                subValue="All time"
                trend="neutral"
            />
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
         <form className="flex-1 flex gap-4 w-full">
             <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                    name="q"
                    defaultValue={searchParams.q}
                    placeholder="Search name, email, message..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 />
             </div>
             <select 
                name="status"
                defaultValue={searchParams.status || 'all'}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
             >
                 <option value="all">All Status</option>
                 <option value="new">New</option>
                 <option value="contacted">Contacted</option>
                 <option value="approved">Approved</option>
                 <option value="rejected">Rejected</option>
             </select>
             <button type="submit" className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800">
                 Filter
             </button>
         </form>
         <div className="text-sm text-gray-500 font-medium">
             Showing {sortedApps.length} results
         </div>
      </div>

      {/* 3. List */}
      <div className="grid gap-6">
        {sortedApps.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
                <p className="text-gray-500">Try adjusting your filters or search query.</p>
            </div>
        ) : (
            sortedApps.map(app => (
                <div key={app.id} className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            {/* Header Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{app.full_name}</h3>
                                    <StatusBadge status={app.status} />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-gray-400" />
                                        <a href={`mailto:${app.email}`} className="hover:text-blue-600 hover:underline">{app.email}</a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-gray-400" />
                                        <span>{app.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span>{app.city_state || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-gray-400" />
                                        <span>{new Date(app.created_at).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative group">
                                    <p className="text-gray-800 whitespace-pre-wrap text-sm">{app.message}</p>
                                    {app.notes_internal && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                                            <span className="font-bold text-gray-700">Internal Note:</span> {app.notes_internal}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                                <form action={updateStatus.bind(null, app.id, 'contacted')}>
                                    <button 
                                        type="submit"
                                        disabled={app.status === 'contacted'}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <MessageSquare size={16} />
                                        Mark Contacted
                                    </button>
                                </form>

                                <form action={updateStatus.bind(null, app.id, 'approved')}>
                                    <button 
                                        type="submit"
                                        disabled={app.status === 'approved'}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <CheckCircle size={16} />
                                        Approve
                                    </button>
                                </form>

                                <form action={updateStatus.bind(null, app.id, 'rejected')}>
                                    <button 
                                        type="submit"
                                        disabled={app.status === 'rejected'}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}

function KpiCard({ title, value, subValue, trend, color = 'gray' }: any) {
    const isUp = trend === 'up';
    const isNeutral = trend === 'neutral';
    
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <div className="flex items-end justify-between">
                <h3 className={`text-2xl font-bold ${color === 'blue' ? 'text-blue-600' : 'text-gray-900'}`}>{value}</h3>
                {!isNeutral && (
                    <div className={`flex items-center text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                        {isUp ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                        {subValue}
                    </div>
                )}
                {isNeutral && <div className="text-xs text-gray-400">{subValue}</div>}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        new: 'bg-blue-50 text-blue-700 border-blue-200',
        contacted: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        approved: 'bg-green-50 text-green-700 border-green-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        email_failed: 'bg-orange-50 text-orange-700 border-orange-200'
    };
    
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
