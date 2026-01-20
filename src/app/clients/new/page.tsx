'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewClientPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    template_id: 'ops-walkthrough',
    name: '',
    spreadsheet_id: ''
  });

  const handleCreate = async () => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      router.push('/clients');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Create New Client</h1>
      
      {/* Step Indicators */}
      <div className="flex items-center mb-8 text-sm">
        <div className={`font-medium ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>1. Template</div>
        <div className="mx-2 text-gray-300">→</div>
        <div className={`font-medium ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>2. Info</div>
        <div className="mx-2 text-gray-300">→</div>
        <div className={`font-medium ${step >= 3 ? 'text-black' : 'text-gray-400'}`}>3. Sheet</div>
      </div>

      <div className="bg-white p-8 rounded-lg border">
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Choose Template</h2>
            <div className="space-y-4">
              <label className="block p-4 border rounded-lg cursor-pointer hover:border-blue-500 bg-blue-50 border-blue-500">
                <input 
                  type="radio" 
                  name="template" 
                  value="ops-walkthrough"
                  checked={formData.template_id === 'ops-walkthrough'}
                  onChange={(e) => setFormData({...formData, template_id: e.target.value})}
                  className="mr-3"
                />
                <span className="font-medium">Ops Walkthrough</span>
                <p className="text-sm text-gray-500 mt-1 ml-6">Monitor asset availability and downtime.</p>
              </label>
              <label className="block p-4 border rounded-lg opacity-50 cursor-not-allowed">
                <input type="radio" disabled className="mr-3" />
                <span className="font-medium">Service Biz (Coming Soon)</span>
              </label>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setStep(2)} className="bg-black text-white px-4 py-2 rounded-md">Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Client Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="text-gray-500">Back</button>
              <button 
                onClick={() => formData.name && setStep(3)} 
                disabled={!formData.name}
                className="bg-black text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Connect Google Sheet</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Spreadsheet ID</label>
                <input 
                  type="text" 
                  value={formData.spreadsheet_id}
                  onChange={(e) => setFormData({...formData, spreadsheet_id: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Make sure to share the sheet with the service account email (if using real Sheets).
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="text-gray-500">Back</button>
              <button 
                onClick={handleCreate}
                disabled={!formData.spreadsheet_id}
                className="bg-black text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Create Client
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
