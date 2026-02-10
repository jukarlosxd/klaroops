'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, FileSpreadsheet, ArrowRight, Check, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  clientId: string;
  isTrial: boolean;
  existingProjectsCount: number;
}

export default function DashboardWizard({ clientId, isTrial, existingProjectsCount }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data State
  const [datasetName, setDatasetName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  
  // Mapping State
  const [mapping, setMapping] = useState({
    date: '',
    metric: '',
    segment: '',
    subsegment: ''
  });

  // Step 1: File Upload & Parse
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (isTrial && existingProjectsCount >= 1) {
      setError("Trial Limit: You can only create 1 dataset on the free trial. Please upgrade.");
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setError('');

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) throw new Error("File is empty or missing headers");

      const detectedHeaders = jsonData[0] as string[];
      const rows = jsonData.slice(1, 11); // Preview first 10 rows

      setHeaders(detectedHeaders);
      setPreviewData(rows);
      setStep(2);
    } catch (err: any) {
      setError("Failed to parse file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Submit
  const handleSubmit = async () => {
    if (!mapping.date || !mapping.metric || !mapping.segment) {
      setError("Please map all required fields.");
      return;
    }

    setLoading(true);
    try {
      // Prepare full data for upload (in real app, might upload to S3/Supabase Storage)
      // For MVP, we'll send the parsed JSON to the API to store in the DB or process
      
      const formData = new FormData();
      formData.append('clientId', clientId);
      formData.append('name', datasetName);
      formData.append('mapping', JSON.stringify(mapping));
      if (file) formData.append('file', file);

      const res = await fetch('/api/dashboard/create', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create dashboard');
      }

      router.push('/dashboard');
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
      
      {/* Header */}
      <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Dashboard</h1>
          <p className="text-sm text-gray-500">Create a change detection dashboard in seconds.</p>
        </div>
        <div className="flex items-center gap-2">
           <StepIndicator num={1} current={step} />
           <div className="w-8 h-px bg-gray-300" />
           <StepIndicator num={2} current={step} />
           <div className="w-8 h-px bg-gray-300" />
           <StepIndicator num={3} current={step} />
        </div>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Dataset Name</label>
                <input 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. Q1 Project Costs"
                  value={datasetName}
                  onChange={e => setDatasetName(e.target.value)}
                />
             </div>

             <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative">
                <input 
                   type="file" 
                   accept=".csv,.xlsx,.xls" 
                   onChange={handleFileUpload}
                   className="absolute inset-0 opacity-0 cursor-pointer"
                   disabled={!datasetName}
                />
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                   {loading ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                </div>
                <h3 className="text-lg font-bold text-gray-900">Upload Spreadsheet</h3>
                <p className="text-gray-500 text-sm mt-1">Support CSV or Excel</p>
                {!datasetName && <p className="text-red-400 text-xs mt-4 font-bold">Please enter a name first</p>}
             </div>
          </div>
        )}

        {/* STEP 2: PREVIEW */}
        {step === 2 && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center">
                 <h3 className="font-bold text-lg">Data Preview</h3>
                 <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-900">Change File</button>
              </div>

              <div className="border rounded-lg overflow-x-auto max-h-[400px]">
                 <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 font-bold text-gray-700">
                       <tr>
                          {headers.map((h, i) => <th key={i} className="px-4 py-3 border-b">{h}</th>)}
                       </tr>
                    </thead>
                    <tbody className="divide-y">
                       {previewData.map((row: any[], i) => (
                          <tr key={i}>
                             {row.map((cell, j) => <td key={j} className="px-4 py-2 whitespace-nowrap">{cell}</td>)}
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              <div className="flex justify-end">
                 <button 
                    onClick={() => setStep(3)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
                 >
                    Next: Map Columns <ArrowRight size={16} />
                 </button>
              </div>
           </div>
        )}

        {/* STEP 3: MAPPING */}
        {step === 3 && (
           <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                 <h4 className="font-bold flex items-center gap-2 mb-1"><Check size={16} /> Almost done!</h4>
                 <p>Tell us which columns match our required fields so we can build your dashboard.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <MappingField 
                    label="Date Column" 
                    desc="When did this happen?" 
                    headers={headers} 
                    value={mapping.date} 
                    onChange={v => setMapping({...mapping, date: v})} 
                    required
                 />
                 <MappingField 
                    label="Metric Column" 
                    desc="What number are we tracking? (Cost, Units, etc.)" 
                    headers={headers} 
                    value={mapping.metric} 
                    onChange={v => setMapping({...mapping, metric: v})} 
                    required
                 />
                 <MappingField 
                    label="Segment Column" 
                    desc="Group by... (Project, Site, Category)" 
                    headers={headers} 
                    value={mapping.segment} 
                    onChange={v => setMapping({...mapping, segment: v})} 
                    required
                 />
                 <MappingField 
                    label="Sub-Segment (Optional)" 
                    desc="Drill down by... (Vendor, Type)" 
                    headers={headers} 
                    value={mapping.subsegment} 
                    onChange={v => setMapping({...mapping, subsegment: v})} 
                 />
              </div>

              <div className="flex justify-between pt-6 border-t">
                 <button onClick={() => setStep(2)} className="text-gray-500 font-medium">Back</button>
                 <button 
                    onClick={handleSubmit}
                    disabled={loading || !mapping.date || !mapping.metric || !mapping.segment}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                 >
                    {loading ? <Loader2 className="animate-spin" /> : 'Generate Dashboard'}
                 </button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}

function StepIndicator({ num, current }: { num: number, current: number }) {
  const active = num <= current;
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
       {active && num < current ? <Check size={16} /> : num}
    </div>
  );
}

interface MappingFieldProps {
  label: string;
  desc: string;
  headers: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

function MappingField({ label, desc, headers, value, onChange, required }: MappingFieldProps) {
   return (
      <div>
         <label className="block font-bold text-gray-900 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
         </label>
         <p className="text-xs text-gray-500 mb-2">{desc}</p>
         <select 
            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={value}
            onChange={e => onChange(e.target.value)}
         >
            <option value="">-- Select Column --</option>
            {headers.map((h: string) => (
               <option key={h} value={h}>{h}</option>
            ))}
         </select>
      </div>
   );
}
