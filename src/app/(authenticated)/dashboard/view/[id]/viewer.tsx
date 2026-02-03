'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    client: any;
    project: any;
    kpiData: any;
    chartData: any[];
}

export default function DashboardViewer({ client, project, kpiData, chartData }: Props) {
    const router = useRouter();
    const chartConfig = JSON.parse(project.chart_config_json || '{}');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-full transition text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{client.name} Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            Live data from {project.data_source_type === 'google_sheets' ? 'Google Sheets' : 'Source'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50">
                        <Filter size={16} />
                        Filter Date
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(kpiData).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">
                            {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                            {typeof value === 'number' 
                                ? (value % 1 !== 0 ? value.toFixed(2) + '%' : value.toLocaleString())
                                : value}
                        </p>
                        {/* Mock Trend */}
                        <div className="mt-2 flex items-center text-xs font-medium text-green-600">
                            <span>+4.5%</span>
                            <span className="text-gray-400 ml-1">vs last period</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(chartConfig).map(([key, config]: [string, any]) => (
                    <div key={key} className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 capitalize">{key.replace(/_/g, ' ')}</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {config.type === 'bar' ? (
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis 
                                            dataKey={config.dimension} 
                                            tick={{fontSize: 12}} 
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis 
                                            tick={{fontSize: 12}} 
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                        />
                                        <Legend />
                                        <Bar dataKey={config.metric} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                ) : (
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis 
                                            dataKey={config.dimension} 
                                            tick={{fontSize: 12}} 
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis 
                                            tick={{fontSize: 12}} 
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey={config.metric} 
                                            stroke="#3b82f6" 
                                            strokeWidth={3}
                                            dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}}
                                        />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
