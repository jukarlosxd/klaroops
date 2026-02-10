'use client';

import React, { useState } from 'react';
import { Database, Save, Download, Globe, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SettingsClient({ googleConfig, googleStatus }: { googleConfig: any, googleStatus: any }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const isGoogleConnected = !!googleStatus?.email;

  const handleSeed = async () => {
    if (!confirm('This will reset/overwrite data. Continue?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      if (res.ok) setMsg('Data seeded successfully!');
      else setMsg('Error seeding data');
    } catch (e) {
      setMsg('Error connecting to server');
    }
    setLoading(false);
  };

  const handleConnectGoogle = async () => {
    try {
        const res = await fetch('/api/admin/google/auth-url');
        if (!res.ok) throw new Error('Failed to get auth URL');
        const { url } = await res.json();
        window.location.href = url;
    } catch (e) {
        alert('Error initiating Google connection');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>

      {/* Google Integration */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Globe className="text-blue-600" size={20} />
          Google Integration (Central Account)
        </h2>
        <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-800 border border-blue-100">
            <p className="font-bold mb-1">How it works:</p>
            <p>1. Connect the system admin account (system@klaroops.com) here.</p>
            <p>2. Clients share their Google Sheets with <strong>{googleStatus?.email || 'system@klaroops.com'}</strong> (Viewer access).</p>
            <p>3. Klaroops automatically reads those sheets using this central connection.</p>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isGoogleConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                    <p className="font-medium text-gray-900">Google Sheets API</p>
                    <p className="text-xs text-gray-500">
                        {isGoogleConnected 
                            ? `Connected as ${googleStatus.email}` 
                            : 'Not connected'}
                    </p>
                </div>
            </div>
            
            {isGoogleConnected ? (
                <div className="flex items-center gap-2">
                     <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        <CheckCircle size={14} />
                        Active
                     </span>
                     <button 
                        onClick={handleConnectGoogle}
                        className="text-sm text-blue-600 hover:underline ml-2"
                     >
                        Reconnect
                     </button>
                </div>
            ) : (
                <button 
                    onClick={handleConnectGoogle}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                >
                    Connect Account
                </button>
            )}
        </div>
      </div>

      {/* Admin Profile */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-bold mb-4">Admin Profile</h2>
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">System Email</label>
            <input disabled value="jukarlosxd@gmail.com" className="w-full px-3 py-2 bg-gray-100 border rounded-lg text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input disabled value="Super Admin" className="w-full px-3 py-2 bg-gray-100 border rounded-lg text-gray-500" />
          </div>
        </div>
      </div>

      {/* Commission Rules */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-bold mb-4">Default Global Rules</h2>
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Commission JSON</label>
            <textarea 
              rows={4} 
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
              defaultValue={JSON.stringify({ rate: 0.10, currency: "USD" }, null, 2)}
            />
          </div>
          <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm">
            <Save size={16} />
            Save Defaults
          </button>
        </div>
      </div>

      {/* Danger Zone / Dev Tools */}
      <div className="bg-white p-6 rounded-xl border shadow-sm border-red-100">
        <h2 className="text-lg font-bold mb-4 text-red-600">Developer Tools</h2>
        <p className="text-sm text-gray-500 mb-4">Use these tools to populate data for testing.</p>
        
        <div className="flex gap-4">
          <button 
            onClick={handleSeed}
            disabled={loading}
            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition"
          >
            <Database size={16} />
            {loading ? 'Seeding...' : 'Seed Demo Data'}
          </button>
          
          <button className="flex items-center gap-2 bg-white text-gray-600 border px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            <Download size={16} />
            Export DB (JSON)
          </button>
        </div>
        {msg && <p className="mt-3 text-sm font-medium text-green-600">{msg}</p>}
      </div>
    </div>
  );
}