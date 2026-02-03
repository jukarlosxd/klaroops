'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Users, 
  DollarSign, 
  Calendar, 
  Settings,
  ArrowLeft,
  Plus,
  Unlink,
  ExternalLink,
  Edit,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Trash2
} from 'lucide-react';

import AppointmentsBoard from '@/components/AppointmentsBoard';

export default function AmbassadorDetailClient({ 
  ambassador, 
  clients = [], 
  commissions = [], 
  appointments = [], 
  auditLogs = [], 
  allClients = [] 
}: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCommModal, setShowCommModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Form states
  const [selectedClientId, setSelectedClientId] = useState('');
  const [commData, setCommData] = useState({ amount: '', note: '', type: 'bonus' });
  const [newPassword, setNewPassword] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const refresh = () => {
    router.refresh();
  };

  const handleAssignClient = async () => {
    if (!selectedClientId) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/ambassadors/${ambassador.id}/clients/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClientId })
      });
      setShowAssignModal(false);
      refresh();
    } catch (e) { alert('Error assigning client'); }
    setLoading(false);
  };

  const handleUnassignClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to unassign this client?')) return;
    setLoading(true);
    try {
        await fetch(`/api/admin/ambassadors/${ambassador.id}/clients/unassign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId })
        });
        refresh();
    } catch (e) { alert('Error'); }
    setLoading(false);
  };

  const handleCreateCommission = async () => {
    setLoading(true);
    try {
        const rawAmount = commData.amount.toString().replace(/,/g, '');
        const parsedAmount = parseFloat(rawAmount);
        
        if (isNaN(parsedAmount)) {
            alert('Please enter a valid amount');
            setLoading(false);
            return;
        }

        const amountCents = Math.round(parsedAmount * 100);
        const finalAmount = commData.type === 'deduction' ? -Math.abs(amountCents) : Math.abs(amountCents);
        
        await fetch('/api/admin/commissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ambassador_id: ambassador.id,
                amount_cents: finalAmount,
                status: 'paid', // Manual adjustments are usually immediate
                note: commData.note || 'Manual Adjustment',
                period_start: new Date().toISOString().split('T')[0],
                period_end: new Date().toISOString().split('T')[0]
            })
        });
        setShowCommModal(false);
        refresh();
    } catch (e) { alert('Error creating commission'); }
    setLoading(false);
  };

  const handleDeleteCommission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commission?')) return;
    setLoading(true);
    try {
        await fetch(`/api/admin/commissions/${id}`, {
            method: 'DELETE'
        });
        refresh();
    } catch (e) { alert('Error deleting commission'); }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!newPassword) return;
    setLoading(true);
    try {
        await fetch(`/api/admin/ambassadors/${ambassador.id}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword })
        });
        alert('Password updated successfully');
        setShowPwdModal(false);
        setNewPassword('');
    } catch (e) { alert('Error updating password'); }
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: string) => {
      if(!confirm(`Change status to ${newStatus}?`)) return;
      setLoading(true);
      try {
          await fetch(`/api/admin/ambassadors/${ambassador.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
          });
          refresh();
      } catch (e) { alert('Error'); }
      setLoading(false);
  };

  const handleDeleteAmbassador = async () => {
    // Final verification before calling API
    // Use trim() to handle potential trailing spaces in database names
    if (deleteConfirmation.trim() !== ambassador.name.trim()) {
        alert('Please type the ambassador name correctly to confirm.');
        return;
    }

    setLoading(true);
    try {
        const res = await fetch(`/api/admin/ambassadors/${ambassador.id}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            // Use a non-blocking notification or redirect immediately
            router.push('/admin/ambassadors');
        } else {
            // Fallback for errors
            console.error('Error deleting ambassador');
        }
    } catch (e) { console.error('Connection error', e); }
    setLoading(false);
  };

  const unassignedClients = allClients.filter((c: any) => !c.ambassador_id);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'commissions', label: 'Commissions', icon: DollarSign },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/ambassadors')} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
            <ArrowLeft size={20} />
            </button>
            <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{ambassador.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{ambassador.email}</span>
                <span>•</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    ambassador.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {ambassador.status}
                </span>
            </div>
            </div>
        </div>
        <div className="flex gap-2">
            {ambassador.status === 'active' ? (
                <button onClick={() => handleStatusChange('inactive')} disabled={loading} className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition">
                    Disable Account
                </button>
            ) : (
                <button onClick={() => handleStatusChange('active')} disabled={loading} className="px-3 py-2 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 text-sm font-medium transition">
                    Enable Account
                </button>
            )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex space-x-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* KPI Cards */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Clients</h3>
              <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                 <Check size={12} /> {clients.filter((c: any) => c.status === 'active').length} Active
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Commission</h3>
              <p className="text-3xl font-bold text-blue-600">
                ${(commissions.filter((c: any) => c.status === 'pending').reduce((acc: number, curr: any) => acc + curr.amount_cents, 0) / 100).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-2">Ready to payout</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Paid (All time)</h3>
              <p className="text-3xl font-bold text-green-700">
                ${(commissions.filter((c: any) => c.status === 'paid').reduce((acc: number, curr: any) => acc + curr.amount_cents, 0) / 100).toLocaleString()}
              </p>
            </div>

            {/* Recent Activity */}
            <div className="md:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity Log</h3>
              <div className="space-y-4">
                {auditLogs.slice(0, 8).map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-500 mt-0.5 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{log.action}</span>
                        <span className="text-gray-400 text-xs">by {log.actor_user_id}</span>
                      </div>
                      <p className="text-gray-600 mt-0.5">
                        {log.entity_type} <span className="font-mono text-xs bg-gray-50 px-1 rounded">{log.entity_id.substring(0,8)}</span>
                      </p>
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && <p className="text-gray-500 italic">No recent activity found.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-end">
                <button 
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                >
                    <Plus size={16} />
                    Assign Existing Client
                </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-700">Client Name</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Joined</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clients.map((client: any) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' : 
                          client.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleUnassignClient(client.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded transition" 
                            title="Unassign"
                          >
                              <Unlink size={16} />
                          </button>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No clients assigned yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'commissions' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex justify-end">
                <button 
                    onClick={() => setShowCommModal(true)}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium shadow-sm"
                >
                    <Plus size={16} />
                    Add Adjustment
                </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-gray-700">Date / Period</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Note</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 font-semibold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {commissions.map((comm: any) => (
                    <tr key={comm.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">
                        <div className="text-xs text-gray-400">{new Date(comm.created_at).toLocaleDateString()}</div>
                        {comm.period_start}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {comm.note || '-'}
                      </td>
                      <td className={`px-6 py-4 font-mono font-medium ${comm.amount_cents < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        ${(comm.amount_cents / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          comm.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          comm.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {comm.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => handleDeleteCommission(comm.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded transition" 
                            title="Delete Commission"
                        >
                            <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                   {commissions.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No commissions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'appointments' && (
          <div className="h-[600px] animate-in fade-in slide-in-from-bottom-2 duration-500">
             <AppointmentsBoard 
                mode="admin" 
                ambassadorId={ambassador.id} 
                initialAppointments={appointments}
                clients={clients} 
             />
          </div>
        )}
        
        {activeTab === 'settings' && (
           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-lg animate-in fade-in">
             <h3 className="font-bold mb-6 text-lg">Account Settings</h3>
             
             <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Commission Rules</h4>
                    <p className="text-sm text-gray-500 mb-3">JSON configuration for automatic calculations.</p>
                    <textarea 
                        className="w-full border rounded-lg p-3 font-mono text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        rows={4}
                        defaultValue={ambassador.commission_rule_json}
                        readOnly // For now
                    />
                </div>

                <div className="pt-6 border-t space-y-4">
                    <h4 className="font-medium text-gray-900">Security</h4>
                    <button 
                        onClick={() => setShowPwdModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium w-full justify-center"
                    >
                        <RefreshCw size={16} />
                        Reset Password
                    </button>
                </div>

                <div className="pt-6 border-t border-red-100">
                    <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} /> Danger Zone
                    </h4>
                    <p className="text-xs text-red-500 mb-3">
                        Deleting an ambassador removes their login access, profile, and unassigns all their clients. This action cannot be undone.
                    </p>
                    
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-red-700 mb-1">
                            Type <span className="font-bold">"{ambassador.name}"</span> to confirm:
                        </label>
                        <input 
                            type="text" 
                            className="w-full border border-red-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
                            placeholder={ambassador.name}
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={handleDeleteAmbassador}
                        disabled={loading || deleteConfirmation.trim() !== ambassador.name.trim()}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        {loading ? 'Deleting...' : 'Delete Ambassador'}
                    </button>
                </div>
             </div>
           </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Assign Client Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold mb-4">Assign Existing Client</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
                    <select 
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {unassignedClients.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {unassignedClients.length === 0 && <p className="text-xs text-red-500 mt-1">No unassigned clients available.</p>}
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button 
                        onClick={handleAssignClient} 
                        disabled={!selectedClientId || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        Assign
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Commission Adjustment Modal */}
      {showCommModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold mb-4">Create Adjustment</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input type="radio" checked={commData.type === 'bonus'} onChange={() => setCommData({...commData, type: 'bonus'})} />
                                Bonus / Payment
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="radio" checked={commData.type === 'deduction'} onChange={() => setCommData({...commData, type: 'deduction'})} />
                                Deduction / Reversal
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                        <input 
                            type="text" 
                            inputMode="decimal"
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            value={commData.amount}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^[\d,.]*$/.test(val)) {
                                    setCommData({...commData, amount: val});
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note / Reason</label>
                        <input 
                            type="text" 
                            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Monthly Bonus"
                            value={commData.note}
                            onChange={(e) => setCommData({...commData, note: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setShowCommModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button 
                        onClick={handleCreateCommission} 
                        disabled={!commData.amount || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
      )}

       {/* Reset Password Modal */}
       {showPwdModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold mb-4">Reset Password</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input 
                        type="text" 
                        className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        placeholder="Enter new secure password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Make sure to copy this password and send it to the ambassador securely. It will be hashed immediately.
                    </p>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowPwdModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button 
                        onClick={handleResetPassword} 
                        disabled={!newPassword || loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}