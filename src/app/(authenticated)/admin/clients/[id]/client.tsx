'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  FileText, 
  UserCheck, 
  LayoutDashboard, 
  Bot, 
  ArrowLeft,
  Save,
  Check,
  AlertTriangle,
  Play,
  Settings,
  Sparkles,
  Loader2,
  RefreshCw,
  MessageSquare,
  ExternalLink,
  Search,
  UserPlus,
  X,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';
import { Client, Ambassador, DashboardProject, AIThread, AuditLog } from '@/types/admin';

interface Props {
  client: Client;
  ambassadors: Ambassador[];
  initialDashboardProject: DashboardProject | null;
  initialAIThreads: AIThread[];
  initialAIProfile: any;
  auditLogs: AuditLog[];
  serviceAccountEmail?: string;
}

// Wizard Steps Definition
type BuilderStep = 'setup' | 'generating' | 'review' | 'active';

export default function ClientDetailClient({ 
  client, 
  ambassadors, 
  initialDashboardProject,
  initialAIThreads,
  initialAIProfile,
  auditLogs,
  serviceAccountEmail
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(initialDashboardProject);
  
  // Assignment State
  const [assignSearch, setAssignSearch] = useState('');
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // AI Profile State
  const [aiProfile, setAiProfile] = useState(initialAIProfile || {
    business_type: '',
    ai_instructions: '',
    kpi_focus: [],
    forbidden_metrics: []
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // AI Builder State
  const [sheetUrl, setSheetUrl] = useState(project?.data_source_config_json ? JSON.parse(project.data_source_config_json).sheetId || '' : '');
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>(project?.selected_sheets_json ? JSON.parse(JSON.stringify(project.selected_sheets_json)) : []);
  const [builderStep, setBuilderStep] = useState<BuilderStep>(
    project?.dashboard_status === 'ready' ? 'active' : 
    project?.dashboard_status === 'draft' ? 'review' : 'setup'
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');
  const [builderError, setBuilderError] = useState('');

  // ... (Keep existing handlers: handleSaveProfile, handleActivate, handleReset, handleChat, Assignment) ...
  // Update handleAutoGenerate to be split into 2 phases: Scan & Generate
  
  const handleScanSheets = async () => {
    if (!sheetUrl) {
        setBuilderError('Please provide a Google Sheets URL.');
        return;
    }
    setBuilderError('');
    setAiLoading(true);
    setAiStatusMessage('Connecting to Google Sheets & Listing Tabs...');

    try {
         const res = await fetch('/api/admin/dashboard-builder/scan', {
            method: 'POST',
            body: JSON.stringify({ sheet_url: sheetUrl }) // Just scan for available sheets first
        });
        
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setAvailableSheets(data.availableSheets || []);
        
        // If no sheets previously selected, default to first
        if (selectedSheets.length === 0 && data.availableSheets?.length > 0) {
            setSelectedSheets([data.availableSheets[0]]);
        }
        setAiStatusMessage('');
    } catch (e: any) {
        setBuilderError(e.message);
    } finally {
        setAiLoading(false);
    }
  };

  const handleGenerateDashboard = async () => {
    // Validation
    if (!aiProfile.business_type) {
        setBuilderError('Please specify a Business Type.');
        return;
    }
    if (selectedSheets.length === 0) {
        setBuilderError('Please select at least one sheet.');
        return;
    }

    setBuilderError('');
    setAiLoading(true);
    setBuilderStep('generating');
    
    try {
        // 1. Save Profile
        await handleSaveProfile(true);

        // 2. Full Scan of Selected Sheets
        setAiStatusMessage(`Scanning ${selectedSheets.length} selected sheet(s)...`);
        const scanRes = await fetch('/api/admin/dashboard-builder/scan', {
            method: 'POST',
            body: JSON.stringify({ 
                sheet_url: sheetUrl, 
                client_id: client.id,
                selected_sheets: selectedSheets 
            }) 
        });
        if (!scanRes.ok) throw new Error(await scanRes.text());

        // 3. Generate Config
        setAiStatusMessage('AI Architect is designing KPIs and Charts across sheets...');
        const res = await fetch('/api/dashboard-builder/auto', {
            method: 'POST',
            body: JSON.stringify({ clientId: client.id })
        });

        if (!res.ok) throw new Error(await res.text());
        const generated = await res.json();

        // 4. Update Local State
        setProject(prev => ({
            ...prev,
            id: prev?.id || 'temp',
            client_id: client.id,
            kpi_rules_json: JSON.stringify(generated.kpi_rules || generated.kpis, null, 2),
            chart_config_json: JSON.stringify(generated.charts, null, 2),
            dashboard_status: 'draft',
            data_source_config_json: JSON.stringify({ sheetId: sheetUrl }),
            selected_sheets_json: selectedSheets // Update local prop if needed
        } as any));

        setBuilderStep('review');

    } catch (e: any) {
        setBuilderError(e.message);
        setBuilderStep('setup');
    } finally {
        setAiLoading(false);
        setAiStatusMessage('');
    }
  };
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'contract', label: 'Contract', icon: FileText },
    { id: 'assignment', label: 'Assignment', icon: UserCheck },
    { id: 'dashboard', label: 'Dashboard Builder', icon: LayoutDashboard },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
  ];

  const handleSaveProfile = async (silent = false) => {
    if (!silent) setProfileSaving(true);
    try {
        const res = await fetch(`/api/admin/clients/${client.id}/ai-profile`, {
            method: 'POST',
            body: JSON.stringify(aiProfile)
        });
        if (res.ok) {
            const saved = await res.json();
            setAiProfile(saved);
            if (!silent) alert('AI Profile Saved!');
        }
    } catch (e) { 
        if (!silent) alert('Error saving profile'); 
    }
    if (!silent) setProfileSaving(false);
  };

  const handleAutoGenerate = async () => {
    // Validation
    if (!aiProfile.business_type) {
        setBuilderError('Please specify a Business Type (e.g. "Manufacturing") so the AI understands the context.');
        return;
    }
    if (!sheetUrl) {
        setBuilderError('Please provide a Google Sheets URL.');
        return;
    }

    setBuilderError('');
    setAiLoading(true);
    setBuilderStep('generating');
    
    try {
        // 1. Save Profile first to ensure backend has context
        await handleSaveProfile(true);

        // 2. Scan Data Source
        setAiStatusMessage('Scanning Data Source & Validating Permissions...');
        const scanRes = await fetch('/api/admin/dashboard-builder/scan', {
            method: 'POST',
            body: JSON.stringify({ sheet_url: sheetUrl, client_id: client.id }) 
        });
        
        if (!scanRes.ok) {
            const err = await scanRes.text();
            throw new Error(`Scan failed: ${err}`);
        }

        // 3. Generate Dashboard Config
        setAiStatusMessage('AI Architect is designing KPIs and Charts...');
        const res = await fetch('/api/dashboard-builder/auto', {
            method: 'POST',
            body: JSON.stringify({ clientId: client.id })
        });

        if (!res.ok) throw new Error(await res.text());
        const generated = await res.json();

        // 4. Update Local State & Move to Review
        setProject(prev => ({
            ...prev,
            id: prev?.id || 'temp',
            client_id: client.id,
            kpi_rules_json: JSON.stringify(generated.kpi_rules || generated.kpis, null, 2),
            chart_config_json: JSON.stringify(generated.charts, null, 2),
            dashboard_status: 'draft',
            // Save source config locally for persistence
            data_source_config_json: JSON.stringify({ sheetId: sheetUrl }) 
        } as any));

        setBuilderStep('review');

    } catch (e: any) {
        setBuilderError(e.message || 'Generation failed. Please check the URL and permissions.');
        setBuilderStep('setup');
    } finally {
        setAiLoading(false);
        setAiStatusMessage('');
    }
  };

  const handleActivate = async () => {
    if(!confirm('This will make the dashboard live for the client. Continue?')) return;
    setLoading(true);
    try {
        const res = await fetch('/api/admin/dashboard-builder/activate', {
            method: 'POST',
            body: JSON.stringify({ client_id: client.id })
        });
        if (!res.ok) throw new Error(await res.text());
        
        setProject(prev => prev ? {...prev, dashboard_status: 'ready'} : null);
        setBuilderStep('active');
        alert('Dashboard is now LIVE!');
    } catch(e: any) { 
        alert('Error activating: ' + e.message); 
    }
    setLoading(false);
  };

  const handleReset = () => {
      if(!confirm('Discard current draft and start over?')) return;
      setBuilderStep('setup');
      setBuilderError('');
  };

  // ... (Chat and Assignment handlers remain unchanged) ...
  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
        const res = await fetch(`/api/admin/clients/${client.id}/ai-chat`, {
            method: 'POST',
            body: JSON.stringify({ message: msg })
        });
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.message.content }]);
    } catch(e) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error processing message.' }]);
    }
    setChatLoading(false);
  };

  const handleAssign = async () => {
    if (!selectedAmbassador) return;
    setLoading(true);
    try {
        const res = await fetch(`/api/admin/clients/${client.id}/assign-ambassador`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ambassador_id: selectedAmbassador.id })
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Assignment updated');
        setShowAssignModal(false);
        router.refresh();
    } catch (error) { alert('Failed to assign'); }
    setLoading(false);
  };

  const handleUnassign = async () => {
    if (!confirm('Unassign ambassador?')) return;
    setLoading(true);
    try {
        const res = await fetch(`/api/admin/clients/${client.id}/assign-ambassador`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ambassador_id: null })
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Unassigned');
        router.refresh();
    } catch (error) { alert('Failed'); }
    setLoading(false);
  };

  const handleDeleteClient = async () => {
    if (!confirm('DELETE client?')) return;
    setLoading(true);
    try {
        const res = await fetch(`/api/admin/clients/${client.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        window.location.href = '/admin/clients';
    } catch (error) { alert('Failed to delete'); setLoading(false); }
  };

  const filteredAmbassadors = ambassadors.filter(a => 
    a.name.toLowerCase().includes(assignSearch.toLowerCase()) || 
    (a.email || '').toLowerCase().includes(assignSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin/clients')} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{client.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{client.industry || 'No Industry'}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {client.status}
                    </span>
                </div>
            </div>
        </div>
        
        <div className="flex gap-2">
            <button onClick={handleDeleteClient} disabled={loading} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium">Delete</button>
            {project?.dashboard_status === 'ready' && (
                <button onClick={() => window.open(`/dashboard/view/${client.id}`, '_blank')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex gap-2 items-center">
                    <ExternalLink size={16} /> Open Dashboard
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
              activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Contract</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Value</span><span className="font-medium">${(client.contract_value_cents ? client.contract_value_cents / 100 : 0).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{client.contract_type}</span></div>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Assignment</h3>
                    {client.ambassador_id ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                {ambassadors.find(a => a.id === client.ambassador_id)?.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{ambassadors.find(a => a.id === client.ambassador_id)?.name}</p>
                                <p className="text-xs text-green-600">Active</p>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setActiveTab('assignment')} className="text-blue-600 text-sm hover:underline">Assign Now</button>
                    )}
                </div>
            </div>
        )}

        {/* DASHBOARD BUILDER (WIZARD FLOW) */}
        {activeTab === 'dashboard' && (
            <div className="max-w-5xl mx-auto animate-in fade-in">
                
                {/* STEP INDICATOR */}
                <div className="mb-8 flex items-center justify-center">
                    <div className={`flex items-center gap-2 ${['setup', 'generating', 'review', 'active'].includes(builderStep) ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">1</div>
                        <span>Context & Data</span>
                    </div>
                    <div className="w-12 h-px bg-gray-300 mx-4"></div>
                    <div className={`flex items-center gap-2 ${['review', 'active'].includes(builderStep) ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">2</div>
                        <span>AI Proposal</span>
                    </div>
                    <div className="w-12 h-px bg-gray-300 mx-4"></div>
                    <div className={`flex items-center gap-2 ${builderStep === 'active' ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">3</div>
                        <span>Live</span>
                    </div>
                </div>

                {/* ERROR MESSAGE */}
                {builderError && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="flex-shrink-0" />
                        <p>{builderError}</p>
                    </div>
                )}

                {/* STEP 1: SETUP */}
                {builderStep === 'setup' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Client Profile */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm">
                            <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-gray-900">
                                <BrainCircuit className="text-purple-600" />
                                1. AI Context (Mandatory)
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">Define the business context so the AI knows what metrics matter.</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Business Type <span className="text-red-500">*</span></label>
                                    <input 
                                        className="w-full border rounded-lg p-3"
                                        placeholder="e.g. Textile Manufacturing, SaaS, Logistics..."
                                        value={aiProfile.business_type || ''}
                                        onChange={e => setAiProfile({...aiProfile, business_type: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Specific Instructions</label>
                                    <textarea 
                                        className="w-full border rounded-lg p-3 h-32"
                                        placeholder="e.g. Focus on machine downtime and defect rates. Ignore financial metrics for now."
                                        value={aiProfile.ai_instructions || ''}
                                        onChange={e => setAiProfile({...aiProfile, ai_instructions: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Data Source */}
                        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
                            <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-gray-900">
                                <FileText className="text-blue-600" />
                                2. Data Source
                            </h3>
                            
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${serviceAccountEmail ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm font-bold text-blue-900">
                                        Google Sheets API: {serviceAccountEmail ? 'Configured' : 'Not Configured'}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-800 mb-2">
                                    Share your Google Sheet with the system service account (Viewer access):
                                </p>
                                <div className="bg-white p-2 rounded border border-blue-200 text-xs font-mono text-gray-600 select-all break-all">
                                    {serviceAccountEmail || 'ERROR: No Service Account Configured'}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Google Sheet URL <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <input 
                                            className="w-full border rounded-lg p-3"
                                            placeholder="https://docs.google.com/spreadsheets/d/..."
                                            value={sheetUrl}
                                            onChange={e => setSheetUrl(e.target.value)}
                                        />
                                        <button 
                                            onClick={handleScanSheets}
                                            disabled={aiLoading || !sheetUrl}
                                            className="px-4 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium text-sm whitespace-nowrap"
                                        >
                                            Scan Sheets
                                        </button>
                                    </div>
                                </div>

                                {availableSheets.length > 0 && (
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Sheets to Include:</label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {availableSheets.map(sheet => (
                                                <label key={sheet} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                                    <input 
                                                        type="checkbox"
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                        checked={selectedSheets.includes(sheet)}
                                                        onChange={e => {
                                                            if (e.target.checked) {
                                                                setSelectedSheets([...selectedSheets, sheet]);
                                                            } else {
                                                                setSelectedSheets(selectedSheets.filter(s => s !== sheet));
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-900">{sheet}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Selected: {selectedSheets.length}</p>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500">
                                    <strong>Tip:</strong> The sheet must have a header row. The AI will scan the first 25 rows.
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t">
                                <button 
                                    onClick={handleGenerateDashboard}
                                    disabled={aiLoading || selectedSheets.length === 0}
                                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition flex justify-center items-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {aiLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            {aiStatusMessage}
                                        </>
                                    ) : (
                                        <>
                                            Generate Dashboard
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: GENERATING (LOADING) */}
                {builderStep === 'generating' && (
                    <div className="bg-white p-12 rounded-xl border shadow-sm text-center">
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles size={32} className="animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Building Dashboard...</h3>
                        <p className="text-gray-500 mb-8">{aiStatusMessage || 'Please wait while AI analyzes the data.'}</p>
                        
                        <div className="max-w-md mx-auto bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-purple-600 animate-progress w-2/3"></div>
                        </div>
                    </div>
                )}

                {/* STEP 3: REVIEW */}
                {builderStep === 'review' && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">Review AI Proposal</h3>
                                <p className="text-sm text-gray-500">The AI has generated this configuration based on your profile.</p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleReset}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium text-sm transition"
                                >
                                    Discard & Edit
                                </button>
                                <button 
                                    onClick={handleActivate}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-md transition flex items-center gap-2"
                                >
                                    <Check size={18} />
                                    Activate Dashboard
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-100 min-h-[400px]">
                            {/* PREVIEW CONTENT */}
                             <div className="space-y-8">
                                {/* KPIs Preview */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Proposed KPIs</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {project?.kpi_rules_json && JSON.parse(project.kpi_rules_json).map((kpi: any, i: number) => (
                                            <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                                                <div className="h-2 w-12 bg-gray-200 my-2 rounded"></div>
                                                <p className="text-xs text-blue-600 font-mono mt-2 bg-blue-50 inline-block px-2 py-1 rounded">
                                                    {kpi.aggregation}({kpi.metric})
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Charts Preview */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Proposed Charts</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {project?.chart_config_json && JSON.parse(project.chart_config_json).map((chart: any, i: number) => (
                                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border flex flex-col items-center text-center h-48 justify-center">
                                                <h5 className="font-bold text-gray-900 mb-4">{chart.title}</h5>
                                                {chart.type === 'line' && <div className="w-full h-12 bg-gradient-to-r from-transparent via-blue-200 to-transparent border-b-2 border-blue-500"></div>}
                                                {chart.type === 'bar' && <div className="flex gap-2 items-end h-16"><div className="w-4 h-8 bg-blue-500"></div><div className="w-4 h-12 bg-blue-300"></div><div className="w-4 h-6 bg-blue-600"></div></div>}
                                                {chart.type === 'pie' && <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-blue-200"></div>}
                                                <p className="text-xs text-gray-400 mt-4">{chart.x} vs {chart.y}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: ACTIVE */}
                {builderStep === 'active' && (
                    <div className="bg-white p-12 rounded-xl border shadow-sm text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={40} />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">Dashboard is Live</h3>
                        <p className="text-gray-500 mb-8">The dashboard has been successfully generated and activated for this client.</p>
                        
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setBuilderStep('setup')}
                                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
                            >
                                Re-configure
                            </button>
                            <button 
                                onClick={() => window.open(`/dashboard/view/${client.id}`, '_blank')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition flex items-center gap-2"
                            >
                                <ExternalLink size={20} />
                                Open Dashboard
                            </button>
                        </div>
                    </div>
                )}

            </div>
        )}

        {/* AI CHAT */}
        {activeTab === 'ai' && (
             <div className="bg-white rounded-xl border shadow-sm h-[600px] flex flex-col overflow-hidden animate-in fade-in">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Bot className="text-purple-600" /> AI Data Analyst</h3>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Beta</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <Bot size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Ask questions about your data.</p>
                        </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>{msg.content}</div>
                        </div>
                    ))}
                    {chatLoading && <div className="flex justify-start"><Loader2 size={16} className="animate-spin text-gray-400" /></div>}
                </div>
                <div className="p-4 border-t bg-white flex gap-2">
                    <input className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Type a message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleChat()} disabled={chatLoading} />
                    <button onClick={handleChat} disabled={!chatInput.trim() || chatLoading} className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"><Play size={20} className="fill-current" /></button>
                </div>
            </div>
        )}

        {/* ASSIGNMENT */}
        {activeTab === 'assignment' && (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4">Assignment Management</h3>
                 <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                         {client.ambassador_id ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{ambassadors.find(a => a.id === client.ambassador_id)?.name.charAt(0)}</div>
                                <div><p className="font-medium">{ambassadors.find(a => a.id === client.ambassador_id)?.name}</p></div>
                            </div>
                         ) : <p>Unassigned</p>}
                    </div>
                    {client.ambassador_id ? <button onClick={handleUnassign} className="text-red-600 text-sm">Unassign</button> : null}
                 </div>
                 <div className="border-t pt-4">
                    <input placeholder="Search ambassador..." className="w-full border rounded p-2 mb-2" value={assignSearch} onChange={e => setAssignSearch(e.target.value)} />
                    <div className="max-h-40 overflow-y-auto space-y-2">
                        {filteredAmbassadors.map(amb => (
                            <div key={amb.id} className="flex justify-between items-center p-2 hover:bg-gray-50">
                                <span>{amb.name}</span>
                                {client.ambassador_id !== amb.id && <button onClick={() => { setSelectedAmbassador(amb); setShowAssignModal(true); }} className="text-blue-600 text-xs">Assign</button>}
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        )}

        {/* LOGS */}
        {activeTab === 'logs' && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden animate-in fade-in">
                <div className="p-6 border-b bg-gray-50">
                    <h3 className="font-bold text-gray-900">Audit Logs</h3>
                    <p className="text-sm text-gray-500">History of changes and activities for this client.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Actor</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {auditLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">No logs found.</td>
                                </tr>
                            ) : (
                                auditLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 font-medium text-gray-900">
                                            {log.actor_user_id === 'system' ? 'System' : 'User'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500 max-w-xs truncate">
                                            {log.before_json && log.after_json ? (
                                                <span title={`Before: ${log.before_json}\nAfter: ${log.after_json}`}>Change detected</span>
                                            ) : (
                                                <span className="opacity-50">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {showAssignModal && selectedAmbassador && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                    <h3 className="text-lg font-bold mb-4">Confirm Assignment</h3>
                    <p className="mb-4">Assign <b>{selectedAmbassador.name}</b> to {client.name}?</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                        <button onClick={handleAssign} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm</button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
