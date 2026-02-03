'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { templates } from '../lib/templates';
import { X } from 'lucide-react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
}

export default function CreateClientModal({ isOpen, onClose, tenantId }: CreateClientModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    spreadsheet_id: '',
    template_id: 'executive-kpi',
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const payload = { ...formData, tenantId };
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.refresh();
      onClose();
      resetForm();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '',
      spreadsheet_id: '',
      template_id: 'executive-kpi',
    });
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-4">Create New Client</h2>

        {/* Step Indicators */}
        <div className="flex items-center mb-8 text-sm">
          <div className={`font-medium ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>1. Company Name</div>
          <div className="mx-2 text-gray-300">→</div>
          <div className={`font-medium ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>2. Google Sheet</div>
          <div className="mx-2 text-gray-300">→</div>
          <div className={`font-medium ${step >= 3 ? 'text-black' : 'text-gray-400'}`}>3. Template</div>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              type="text"
              placeholder="e.g., Acme Corporation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>
        )}

        {/* Step 2: Spreadsheet ID */}
        {step === 2 && (
          <div>
            <label className="block text-sm font-medium mb-1">Google Sheets Link</label>
            <input
              type="text"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={formData.spreadsheet_id}
              onChange={(e) => setFormData({ ...formData, spreadsheet_id: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
             <p className="text-xs text-gray-500 mt-1">
              The link to the Google Sheet for data synchronization.
            </p>
          </div>
        )}

        {/* Step 3: Template Selection */}
        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <label
                  key={template.id}
                  className={`block p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                    formData.template_id === template.id ? 'bg-blue-50 border-blue-500' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.id}
                    checked={formData.template_id === template.id}
                    onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                    className="hidden"
                  />
                  <div className="font-medium text-lg">{template.name}</div>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
              >
                Back
              </button>
            )}
          </div>
          <div>
            {step < 3 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !formData.name) || (step === 2 && !formData.spreadsheet_id)}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Client'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
