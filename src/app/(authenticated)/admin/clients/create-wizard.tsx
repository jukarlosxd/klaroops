'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ChevronRight, 
  Check, 
  Building2, 
  FileText, 
  LayoutDashboard,
  Bot
} from 'lucide-react';
import { Ambassador } from '@/types/admin';

interface Props {
    ambassadors: Ambassador[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateClientWizard({ ambassadors, onClose, onSuccess }: Props) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Form Data
    const [formData, setFormData] = useState({
        // Step 1: Profile
        name: '',
        legal_name: '',
        industry: '',
        notes_internal: '',
        
        // Step 2: Contract
        ambassador_id: '',
        contract_value: '',
        contract_type: 'monthly',
        contract_start: new Date().toISOString().split('T')[0],
        onboarding_status: 'new',
        
        // Step 3: Dashboard
        template_key: 'sales_overview',
    });

    const handleNext = () => {
        if (step === 1 && !formData.name) return alert('Name is required');
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Create Client
            const res = await fetch('/api/admin/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    legal_name: formData.legal_name,
                    industry: formData.industry,
                    notes_internal: formData.notes_internal,
                    status: 'active',
                    
                    ambassador_id: formData.ambassador_id || null,
                    
                    contract_value_cents: formData.contract_value ? Math.round(parseFloat(formData.contract_value) * 100) : 0,
                    contract_currency: 'USD',
                    contract_type: formData.contract_type,
                    contract_start: formData.contract_start,
                    onboarding_status: formData.onboarding_status
                })
            });

            if (!res.ok) throw new Error('Failed to create client');
            
            const newClient = await res.json();

            // 2. Create Dashboard Project (if needed)
            if (formData.template_key) {
                await fetch(`/api/admin/clients/${newClient.id}/dashboard-project`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        template_key: formData.template_key,
                        dashboard_status: 'configuring'
                    })
                });
            }

            onSuccess();
            // Optional: Redirect to detail page
            // router.push(`/admin/clients/${newClient.id}`);
            
        } catch (error) {
            console.error(error);
            alert('Error creating client');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">New Client Onboarding</h2>
                        <p className="text-sm text-gray-500">Step {step} of 3</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-1">
                    <div 
                        className="bg-blue-600 h-1 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    
                    {/* STEP 1: PROFILE */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Client Profile</h3>
                                    <p className="text-sm text-gray-500">Basic information about the company.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Acme Corp"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        autoFocus
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Acme Corporation LLC"
                                        value={formData.legal_name}
                                        onChange={e => setFormData({...formData, legal_name: e.target.value})}
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                    <select 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={formData.industry}
                                        onChange={e => setFormData({...formData, industry: e.target.value})}
                                    >
                                        <option value="">Select Industry...</option>
                                        <option value="retail">Retail / E-commerce</option>
                                        <option value="manufacturing">Manufacturing</option>
                                        <option value="saas">SaaS / Tech</option>
                                        <option value="services">Professional Services</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                                    <textarea 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows={3}
                                        placeholder="Key contacts, specific requirements, or context..."
                                        value={formData.notes_internal}
                                        onChange={e => setFormData({...formData, notes_internal: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CONTRACT */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Contract & Assignment</h3>
                                    <p className="text-sm text-gray-500">Define ownership and financial terms.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Ambassador</label>
                                    <select 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={formData.ambassador_id}
                                        onChange={e => setFormData({...formData, ambassador_id: e.target.value})}
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {ambassadors.map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.status})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input 
                                            type="number" 
                                            className="w-full border rounded-lg pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0.00"
                                            value={formData.contract_value}
                                            onChange={e => setFormData({...formData, contract_value: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                                    <select 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={formData.contract_type}
                                        onChange={e => setFormData({...formData, contract_type: e.target.value})}
                                    >
                                        <option value="monthly">Monthly Recurring</option>
                                        <option value="one-time">One-time Project</option>
                                    </select>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.contract_start}
                                        onChange={e => setFormData({...formData, contract_start: e.target.value})}
                                    />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding Status</label>
                                    <select 
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={formData.onboarding_status}
                                        onChange={e => setFormData({...formData, onboarding_status: e.target.value})}
                                    >
                                        <option value="new">New (Pre-kickoff)</option>
                                        <option value="onboarding">Onboarding In Progress</option>
                                        <option value="live">Live / Active</option>
                                        <option value="paused">Paused</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                     {/* STEP 3: DASHBOARD */}
                     {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                    <LayoutDashboard size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Dashboard Configuration</h3>
                                    <p className="text-sm text-gray-500">Initialize the client's reporting dashboard.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                                    <Bot className="text-blue-600 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-bold text-blue-800 text-sm">AI Assistant Available</h4>
                                        <p className="text-xs text-blue-600 mt-1">
                                            You can configure the data mapping and specific KPI rules later using the AI Assistant in the client detail page.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { id: 'sales_overview', name: 'Sales Overview', desc: 'Revenue, Deals, Conversion' },
                                            { id: 'manufacturing', name: 'Manufacturing Ops', desc: 'OEE, Production Rate, Defects' },
                                            { id: 'marketing', name: 'Marketing Funnel', desc: 'Leads, CAC, ROAS' },
                                            { id: 'custom', name: 'Empty / Custom', desc: 'Build from scratch' },
                                        ].map(t => (
                                            <div 
                                                key={t.id}
                                                onClick={() => setFormData({...formData, template_key: t.id})}
                                                className={`cursor-pointer border rounded-lg p-4 hover:border-blue-500 transition ${
                                                    formData.template_key === t.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-gray-900">{t.name}</span>
                                                    {formData.template_key === t.id && <Check size={16} className="text-blue-600" />}
                                                </div>
                                                <p className="text-xs text-gray-500">{t.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                    {step > 1 ? (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
                        >
                            Back
                        </button>
                    ) : (
                        <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
                    )}

                    {step < 3 ? (
                        <button 
                            onClick={handleNext}
                            disabled={!formData.name}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            Next Step <ChevronRight size={16} />
                        </button>
                    ) : (
                         <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Client & Finish'}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
