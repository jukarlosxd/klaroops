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
  X
} from 'lucide-react';
import { Client, Ambassador, DashboardProject, AIThread, AuditLog } from '@/types/admin';

interface Props {
  client: Client;
  ambassadors: Ambassador[];
  initialDashboardProject: DashboardProject | null;
  initialAIThreads: AIThread[];
  auditLogs: AuditLog[];
}

export default function ClientDetailClient({ 
  client, 
  ambassadors, 
  initialDashboardProject,
  initialAIThreads,
  auditLogs 
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(initialDashboardProject);
  
  // Assignment State
  const [assignSearch, setAssignSearch] = useState('');
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // AI Builder State
  const [sheetUrl, setSheetUrl] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);

  // AI Chat State
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

  const handleUpdateDashboard = async (newData: any) => {
    setLoading(true);
    try {
        const res = await fetch(`/api/admin/clients/${client.id}/dashboard-project`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData)
        });
        if (res.ok) {
            const updated = await res.json();
            setProject(updated);
            alert('Dashboard configuration saved.');
        }
    } catch (e) { console.error(e); alert('Error saving'); }
    setLoading(false);
  };

  const handleGenerateWithAI = async () => {
    if (!sheetUrl) return alert('Please enter a Google Sheet URL');
    setAiLoading(true);
    
    try {
        // 1. Scan Sheet
        setAiStep('Scanning Google Sheet...');
        const scanRes = await fetch('/api/admin/dashboard-builder/scan', {
            method: 'POST',
            body: JSON.stringify({ sheet_url: sheetUrl })
        });
        
        if (!scanRes.ok) throw new Error(await scanRes.text());
        const scanData = await scanRes.json();

        // 2. Generate Config
        setAiStep('Analyzing data & generating config...');
        const genRes = await fetch('/api/admin/dashboard-builder/generate', {
            method: 'POST',
            body: JSON.stringify({
                client_id: client.id,
                template_key: project?.template_key || 'custom',
                headers: scanData.headers,
                sample_rows: scanData.sampleRows,
                inferred_types: scanData.inferredTypes
            })
        });

        if (!genRes.ok) throw new Error(await genRes.text());
        const generated = await genRes.json();

        // Update local state with generated config
        setProject(prev => prev ? {
            ...prev,
            data_source_config_json: JSON.stringify(generated.source_config, null, 2),
            mapping_json: JSON.stringify(generated.column_mapping, null, 2),
            kpi_rules_json: JSON.stringify(generated.kpi_rules, null, 2),
            dashboard_status: 'configuring'
        } : null);

        setAiStep('Done!');
        alert('Configuration generated! Review the mapping below.');

    } catch (e: any) {
        console.error(e);
        // Truncate error message if too long for alert
        const msg = e.message || 'Generation failed';
        alert(`Error: ${msg.length > 200 ? msg.substring(0, 200) + '...' : msg}`);
    } finally {
        setAiLoading(false);
        setAiStep('');
    }
  };

  const handleActivate = async () => {
    if(!confirm('Are you sure you want to activate this dashboard?')) return;
    setLoading(true);
    try {
        await fetch('/api/admin/dashboard-builder/activate', {
            method: 'POST',
            body: JSON.stringify({ client_id: client.id })
        });
        setProject(prev => prev ? {...prev, dashboard_status: 'ready'} : null);
        alert('Dashboard Activated!');
    } catch(e) { alert('Error activating'); }
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);

    try {
        const res = await fetch(`/api/admin/clients/${client.id}/ai-chat`, {
            method: 'POST',
            body: JSON.stringify({ message: msg }) // thread_id handling simplified for demo
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
        
        const updatedClient = await res.json();
        alert('Assignment updated successfully');
        setShowAssignModal(false);
        router.refresh();
        
    } catch (error: any) {
        console.error(error);
        alert('Failed to assign ambassador');
    }
    setLoading(false);
  };

  const handleUnassign = async () => {
    if (!confirm('Are you sure you want to unassign the current ambassador?')) return;
    setLoading(true);
    try {
        const res = await fetch(`/api/admin/clients/${client.id}/assign-ambassador`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ambassador_id: null })
        });
        
        if (!res.ok) throw new Error(await res.text());
        
        alert('Ambassador unassigned');
        router.refresh();
        
    } catch (error: any) {
        console.error(error);
        alert('Failed to unassign');
    }
    setLoading(false);
  };

  const handleDeleteClient = async () => {
    if (!confirm('Are you sure you want to DELETE this client? This action cannot be undone and will remove all associated data including dashboard configuration.')) return;
    setLoading(true);
    try {
        const res = await fetch(`/api/admin/clients/${client.id}`, {
            method: 'DELETE',
        });
        
        if (!res.ok) throw new Error(await res.text());
        
        alert('Client deleted successfully');
        router.push('/admin/clients');
        
    } catch (error: any) {
        console.error(error);
        alert('Failed to delete client');
        setLoading(false);
    }
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
                    <span>•</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {client.status}
                    </span>
                </div>
            </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
            <button 
                onClick={handleDeleteClient}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm transition"
            >
                <X size={16} />
                Delete
            </button>
            {project?.dashboard_status === 'ready' && (
                <button 
                    onClick={() => window.open(`/dashboard/view/${client.id}`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition"
                >
                    <ExternalLink size={16} />
                    Open Live Dashboard
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
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Contract Details</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Value</span>
                            <span className="font-medium">
                                ${(client.contract_value_cents ? client.contract_value_cents / 100 : 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Type</span>
                            <span className="font-medium capitalize">{client.contract_type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Start Date</span>
                            <span className="font-medium">{client.contract_start || '-'}</span>
                        </div>
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
                                <p className="font-medium text-gray-900">
                                    {ambassadors.find(a => a.id === client.ambassador_id)?.name}
                                </p>
                                <p className="text-xs text-green-600">Active Ambassador</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed">
                            <p className="text-sm text-gray-500 mb-2">No ambassador assigned</p>
                            <button 
                                onClick={() => setActiveTab('assignment')}
                                className="text-blue-600 text-xs font-medium hover:underline"
                            >
                                Assign Now
                            </button>
                        </div>
                    )}
                </div>

                <div className="md:col-span-3 bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Audit Log</h3>
                    <div className="space-y-2">
                        {auditLogs.slice(0, 5).map(log => (
                            <div key={log.id} className="text-xs flex gap-3 py-2 border-b last:border-0">
                                <span className="text-gray-400 font-mono">{new Date(log.created_at).toLocaleDateString()}</span>
                                <span className="font-medium text-gray-900">{log.action}</span>
                                <span className="text-gray-500">by {log.actor_user_id}</span>
                            </div>
                        ))}
                        {auditLogs.length === 0 && <p className="text-sm text-gray-500 italic">No activity recorded yet.</p>}
                    </div>
                </div>
            </div>
        )}

        {/* DASHBOARD BUILDER */}
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Configuration</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                project?.dashboard_status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {project?.dashboard_status || 'NOT STARTED'}
                            </span>
                        </div>

                        {/* AI Generator Section */}
                        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <h4 className="font-bold text-purple-900 flex items-center gap-2 mb-2">
                                <Sparkles size={18} />
                                AI Generator
                            </h4>
                            <p className="text-sm text-purple-700 mb-3">
                                Paste a Google Sheets link to auto-generate the configuration.
                            </p>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 border border-purple-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    value={sheetUrl}
                                    onChange={(e) => setSheetUrl(e.target.value)}
                                    disabled={aiLoading}
                                />
                                <button 
                                    onClick={handleGenerateWithAI}
                                    disabled={aiLoading || !sheetUrl}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                                    Generate
                                </button>
                            </div>
                            {aiStep && (
                                <p className="text-xs text-purple-600 mt-2 font-medium animate-pulse">
                                    {aiStep}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                                <select 
                                    className="w-full border rounded-lg p-2 bg-gray-50"
                                    value={project?.template_key || 'custom'}
                                    disabled
                                >
                                    <option value="sales_overview">Sales Overview</option>
                                    <option value="manufacturing">Manufacturing Ops</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data Source Type</label>
                                <select 
                                    className="w-full border rounded-lg p-2"
                                    value={project?.data_source_type || 'manual'}
                                    onChange={(e) => handleUpdateDashboard({ data_source_type: e.target.value })}
                                >
                                    <option value="manual">Manual Entry</option>
                                    <option value="google_sheets">Google Sheets</option>
                                    <option value="csv">CSV Upload</option>
                                    <option value="api">API Integration</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Source Config (JSON)</label>
                                <textarea 
                                    className="w-full border rounded-lg p-3 font-mono text-xs h-32"
                                    value={project?.data_source_config_json || '{}'}
                                    onChange={(e) => setProject(prev => prev ? ({...prev, data_source_config_json: e.target.value}) : null)}
                                    placeholder='{"sheetId": "..."}'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm h-full flex flex-col">
                        <h3 className="font-bold text-lg mb-4">Mapping & Rules</h3>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Column Mapping (JSON)</label>
                                <textarea 
                                    className="w-full border rounded-lg p-3 font-mono text-xs h-40"
                                    value={project?.mapping_json || '{}'}
                                    onChange={(e) => setProject(prev => prev ? ({...prev, mapping_json: e.target.value}) : null)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">KPI Rules (JSON)</label>
                                <textarea 
                                    className="w-full border rounded-lg p-3 font-mono text-xs h-40"
                                    value={project?.kpi_rules_json || '{}'}
                                    onChange={(e) => setProject(prev => prev ? ({...prev, kpi_rules_json: e.target.value}) : null)}
                                />
                            </div>
                        </div>
                        <div className="pt-6 mt-4 border-t flex justify-end gap-3">
                            <button 
                                onClick={handleActivate}
                                disabled={loading || project?.dashboard_status === 'ready'}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-300"
                            >
                                <Check size={16} />
                                {project?.dashboard_status === 'ready' ? 'Active' : 'Activate'}
                            </button>
                            <button 
                                onClick={() => handleUpdateDashboard({ 
                                    data_source_config_json: project?.data_source_config_json,
                                    mapping_json: project?.mapping_json,
                                    kpi_rules_json: project?.kpi_rules_json
                                })}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Save size={16} />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* AI CHAT */}
        {activeTab === 'ai' && (
            <div className="bg-white rounded-xl border shadow-sm h-[600px] flex flex-col overflow-hidden animate-in fade-in">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <Bot className="text-purple-600" />
                        AI Data Analyst
                    </h3>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Beta</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <Bot size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Ask questions about your data or configuration.</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {["What columns are available?", "How is revenue calculated?", "Map 'Amount' to Revenue"].map(q => (
                                    <button 
                                        key={q} 
                                        onClick={() => setChatInput(q)}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-lg p-3 rounded-bl-none">
                                <Loader2 size={16} className="animate-spin text-gray-400" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-white">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Type a message..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                            disabled={chatLoading}
                        />
                        <button 
                            onClick={handleChat}
                            disabled={!chatInput.trim() || chatLoading}
                            className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            <Play size={20} className="fill-current" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* ASSIGNMENT TAB */}
        {activeTab === 'assignment' && (
            <div className="space-y-6 animate-in fade-in">
                {/* Current Assignment Card */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Current Assignment</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {client.ambassador_id ? (
                                <>
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {ambassadors.find(a => a.id === client.ambassador_id)?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-lg">
                                            {ambassadors.find(a => a.id === client.ambassador_id)?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {ambassadors.find(a => a.id === client.ambassador_id)?.email}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-3 text-gray-500">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <UserCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Unassigned</p>
                                        <p className="text-sm">This client is not managed by anyone.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {client.ambassador_id && (
                            <button 
                                onClick={handleUnassign}
                                disabled={loading}
                                className="text-red-600 text-sm font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition"
                            >
                                Unassign
                            </button>
                        )}
                    </div>
                </div>

                {/* Assignment List */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Available Ambassadors</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                value={assignSearch}
                                onChange={(e) => setAssignSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="divide-y max-h-[400px] overflow-y-auto">
                        {filteredAmbassadors.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No ambassadors found.</div>
                        ) : (
                            filteredAmbassadors.map(amb => (
                                <div key={amb.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium text-gray-600">
                                            {amb.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{amb.name}</p>
                                            <p className="text-xs text-gray-500">{amb.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                                            amb.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {amb.status}
                                        </span>
                                        {client.ambassador_id !== amb.id && (
                                            <button 
                                                onClick={() => {
                                                    setSelectedAmbassador(amb);
                                                    setShowAssignModal(true);
                                                }}
                                                className="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                                            >
                                                Assign
                                            </button>
                                        )}
                                        {client.ambassador_id === amb.id && (
                                            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                <Check size={16} /> Assigned
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* ASSIGN MODAL */}
        {showAssignModal && selectedAmbassador && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Assignment</h3>
                    
                    <div className="space-y-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-800 mb-1">Client</p>
                            <p className="font-bold text-blue-900">{client.name}</p>
                        </div>
                        <div className="flex justify-center">
                            <ArrowLeft className="rotate-[-90deg] text-gray-400" />
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <p className="text-sm text-green-800 mb-1">New Ambassador</p>
                            <p className="font-bold text-green-900">{selectedAmbassador.name}</p>
                            <p className="text-xs text-green-700">{selectedAmbassador.email}</p>
                        </div>
                        
                        {client.ambassador_id && (
                            <div className="flex items-start gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg text-sm">
                                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                <p>This will reassign the client from their current ambassador. This action is logged.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setShowAssignModal(false)}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleAssign}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Confirm Assignment
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Placeholder for other tabs */}
        {(activeTab === 'contract') && (
            <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed">
                <Settings className="mx-auto text-gray-400 mb-2" size={32} />
                <h3 className="font-medium text-gray-900">Work in Progress</h3>
                <p className="text-sm text-gray-500">This section is being implemented.</p>
            </div>
        )}

      </div>
    </div>
  );
}
