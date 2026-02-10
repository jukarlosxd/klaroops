'use client';

import { useState, useMemo } from 'react';
import { DashboardProject } from '@/types/admin';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Filter, AlertTriangle } from 'lucide-react';

interface Props {
  project: DashboardProject;
}

export default function ChangeDetectionDashboard({ project }: Props) {
  const [periodDays, setPeriodDays] = useState(30);

  // 1. Parse Configuration & Data
  const { data, mapping, processingError } = useMemo(() => {
    try {
      const rawData = JSON.parse(project.dataset_profile_json || '[]');
      const map = JSON.parse(project.mapping_json);
      
      // Basic normalization
      const cleanData = rawData.map((row: any) => ({
        date: new Date(row[map.date]),
        value: Number(row[map.metric]) || 0,
        segment: String(row[map.segment] || 'Unknown'),
        subsegment: map.subsegment ? String(row[map.subsegment] || '') : null
      })).filter((d: any) => !isNaN(d.date.getTime()));

      return { data: cleanData.sort((a: any, b: any) => a.date.getTime() - b.date.getTime()), mapping: map, processingError: null };
    } catch (e: any) {
      return { data: [], mapping: {}, processingError: e.message };
    }
  }, [project]);

  // 2. Calculate Metrics (Current vs Previous)
  const stats = useMemo(() => {
    if (!data.length) return null;

    const lastDate = data[data.length - 1].date;
    const cutoffDate = new Date(lastDate);
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);
    
    const prevCutoffDate = new Date(cutoffDate);
    prevCutoffDate.setDate(prevCutoffDate.getDate() - periodDays);

    let currentTotal = 0;
    let previousTotal = 0;
    const segmentChanges: Record<string, { current: number, previous: number }> = {};
    const trendData: any[] = [];

    // Group by Day for Trend
    const dailyMap: Record<string, number> = {};

    data.forEach((d: any) => {
      const isCurrent = d.date > cutoffDate && d.date <= lastDate;
      const isPrevious = d.date > prevCutoffDate && d.date <= cutoffDate;

      if (isCurrent) {
        currentTotal += d.value;
        if (!segmentChanges[d.segment]) segmentChanges[d.segment] = { current: 0, previous: 0 };
        segmentChanges[d.segment].current += d.value;
        
        const dayKey = d.date.toISOString().split('T')[0];
        dailyMap[dayKey] = (dailyMap[dayKey] || 0) + d.value;
      }
      
      if (isPrevious) {
        previousTotal += d.value;
        if (!segmentChanges[d.segment]) segmentChanges[d.segment] = { current: 0, previous: 0 };
        segmentChanges[d.segment].previous += d.value;
      }
    });

    // Fill Trend Data
    Object.keys(dailyMap).sort().forEach(date => {
        trendData.push({ date, value: dailyMap[date] });
    });

    // 3. Find Top Drivers
    const drivers = Object.keys(segmentChanges).map(seg => {
      const current = segmentChanges[seg].current;
      const previous = segmentChanges[seg].previous;
      const change = current - previous;
      return { segment: seg, current, previous, change };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    const totalChange = currentTotal - previousTotal;
    const percentChange = previousTotal === 0 ? 100 : ((totalChange / previousTotal) * 100);

    // Decision Sentence Logic
    const topDriver = drivers[0];
    let sentence = `Total ${mapping.metric} remained stable compared to the previous ${periodDays} days.`;
    
    if (Math.abs(percentChange) > 1) {
       const direction = totalChange > 0 ? 'increased' : 'decreased';
       let driverPart = '';
       
       if (topDriver) {
          const driverContribution = Math.abs(totalChange) === 0 ? 0 : Math.round((Math.abs(topDriver.change) / Math.abs(totalChange)) * 100);
          driverPart = `${driverContribution}% of this change comes from ${topDriver.segment}.`;
       }
       
       sentence = `Total ${mapping.metric} ${direction} ${Math.abs(Math.round(percentChange))}% compared to the previous ${periodDays} days. ${driverPart}`;
    }

    return {
      currentTotal,
      previousTotal,
      totalChange,
      percentChange,
      drivers: drivers.slice(0, 5), // Top 5
      trendData,
      sentence
    };
  }, [data, periodDays, mapping]);

  if (processingError) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
        <AlertTriangle className="mx-auto mb-2" size={32} />
        <h3 className="font-bold">Error Processing Data</h3>
        <p className="text-sm">{processingError}</p>
      </div>
    );
  }

  if (!stats) return <div className="p-12 text-center text-gray-500">Loading analysis...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 1. Decision Sentence (Top of Page) */}
      <div id="decision-sentence" className="bg-blue-900 text-white p-6 rounded-xl shadow-lg flex items-start gap-4">
         <div className="p-3 bg-white/10 rounded-full">
            <Filter size={24} className="text-blue-200" />
         </div>
         <div>
            <h2 className="text-xl font-bold leading-tight">{stats.sentence}</h2>
            <p className="text-blue-200 text-sm mt-1">
               Comparing last {periodDays} days vs previous period. 
               <button onClick={() => setPeriodDays(periodDays === 30 ? 7 : 30)} className="ml-2 underline hover:text-white">
                  Switch to {periodDays === 30 ? '7 Days' : '30 Days'}
               </button>
            </p>
         </div>
      </div>

      {/* 2. KPI Summary */}
      <div className="grid md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total {mapping.metric}</h3>
            <div className="mt-2 flex items-baseline gap-3">
               <span className="text-4xl font-extrabold text-gray-900">
                  {stats.currentTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
               </span>
               <span className={`flex items-center text-sm font-bold ${stats.percentChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.percentChange >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {Math.abs(Math.round(stats.percentChange))}%
               </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">vs {stats.previousTotal.toLocaleString()} previous</p>
         </div>

         <div id="main-chart" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm col-span-2">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Trend Over Time</h3>
            <div className="h-24 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trendData}>
                     <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
                     <Tooltip />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* 3. Top Drivers Table */}
      <div id="drivers-table" className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">Top Drivers of Change</h3>
            <p className="text-sm text-gray-500">Breakdown by {mapping.segment}</p>
         </div>
         <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                     <th className="px-6 py-3">{mapping.segment}</th>
                     <th className="px-6 py-3 text-right">Current</th>
                     <th className="px-6 py-3 text-right">Previous</th>
                     <th className="px-6 py-3 text-right">Change</th>
                     <th className="px-6 py-3 text-right">Impact</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {stats.drivers.map((driver, i) => (
                     <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{driver.segment}</td>
                        <td className="px-6 py-4 text-right">{driver.current.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-gray-500">{driver.previous.toLocaleString()}</td>
                        <td className={`px-6 py-4 text-right font-bold ${driver.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                           {driver.change > 0 ? '+' : ''}{driver.change.toLocaleString()}
                        </td>
                         <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full ${driver.change > 0 ? 'bg-red-500' : 'bg-green-500'}`} 
                                    style={{ width: `${Math.min(100, Math.abs((driver.change / stats.totalChange) * 100))}%` }} 
                                 />
                              </div>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

    </div>
  );
}
