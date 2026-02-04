'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, MoreHorizontal, Copy, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AmbassadorsClient({ ambassadors }: any) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Create Form State
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);

  // Safely handle potentially undefined ambassadors
  const safeAmbassadors = Array.isArray(ambassadors) ? ambassadors : [];

  const filteredAmbassadors = safeAmbassadors.filter((amb: any) => 
    amb.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    amb.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await fetch('/api/admin/ambassadors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (res.ok) {
            setCreatedCredentials({ email: formData.email, password: formData.password });
            setFormData({ name: '', email: '', password: '' });
            router.refresh();
        } else {
            const err = await res.json();
            alert(err.error || 'Error creating ambassador');
        }
    } catch (error) {
        alert('Connection error');
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!createdCredentials) return;
    const text = `KlaroOps Login\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nLogin at: https://klaroops.com/login`;
    navigator.clipboard.writeText(text);
    alert('Credentials copied to clipboard!');
  };

  const closeAndReset = () => {
      setShowCreateModal(false);
      setCreatedCredentials(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Ambassadors Management</h1>
        <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition font-medium shadow-sm"
        >
          <Plus size={18} />
          Add Ambassador
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 text-gray-600">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Name / Email</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-center">Active Clients</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-right">Pending Comm.</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAmbassadors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No ambassadors found matching your search.
                </td>
              </tr>
            ) : (
              filteredAmbassadors.map((amb: any) => (
                <tr key={amb.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{amb.name}</div>
                    <div className="text-gray-500 text-xs">{amb.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      amb.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {amb.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-gray-900">{amb.activeClients}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-500">{amb.totalClients}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    ${amb.pendingCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/admin/ambassadors/${amb.id}`}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <MoreHorizontal size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                  {!createdCredentials ? (
                      <form onSubmit={handleCreate}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">New Ambassador</h3>
                            <button type="button" onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input 
                                    required
                                    type="email" 
                                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                    placeholder="StrongPassword123"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                            >
                                {loading ? 'Creating...' : 'Create Ambassador'}
                            </button>
                        </div>
                      </form>
                  ) : (
                      <div className="text-center py-4">
                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Check size={24} />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Success!</h3>
                          <p className="text-gray-600 mb-6">Ambassador account has been created.</p>
                          
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left mb-6">
                              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Credentials</p>
                              <div className="space-y-1">
                                  <p className="text-sm"><span className="text-gray-500 w-16 inline-block">Email:</span> <span className="font-medium">{createdCredentials.email}</span></p>
                                  <p className="text-sm"><span className="text-gray-500 w-16 inline-block">Pass:</span> <span className="font-mono font-medium">{createdCredentials.password}</span></p>
                              </div>
                          </div>

                          <button 
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition mb-3"
                          >
                              <Copy size={16} /> Copy Instructions
                          </button>
                          
                          <button onClick={closeAndReset} className="text-gray-500 hover:text-gray-700 text-sm">
                              Close
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}