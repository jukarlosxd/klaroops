'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Metrics } from '@/lib/metrics';

export function Charts({ metrics }: { metrics: Metrics }) {
  return (
    <div className="space-y-8">
      {/* Availability Trend */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-6">7-Day Availability Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.availabilityTrend}>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <Tooltip />
              <Line type="monotone" dataKey="availability" stroke="#000000" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Problem Areas */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-6">Top Problem Areas (Downtime)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.topProblemAreas} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="area" type="category" width={100} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#000000" radius={[0, 4, 4, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
