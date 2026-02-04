import React from 'react';
import { getAuditLogs } from '@/lib/admin-db';
import { Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuditLogPage(props: { searchParams: Promise<any> }) {
  await props.searchParams; // Consume searchParams even if not used to satisfy Next.js 15
  
  try {
    const rawLogs = await getAuditLogs();
    // Ensure rawLogs is an array and sort by created_at descending if possible
    const logs = Array.isArray(rawLogs) ? [...rawLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];

    return (
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">System Audit Log</h1>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Timestamp</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Actor</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Action</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Entity</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Changes</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {log.actor_user_id}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono font-bold text-gray-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {log.entity_type} <span className="text-xs text-gray-400">({log.entity_id.substring(0, 6)}...)</span>
                  </td>
                  <td className="px-6 py-4">
                    <details className="group">
                      <summary className="cursor-pointer text-blue-600 text-xs font-medium hover:underline">
                        View JSON Diff
                      </summary>
                      <div className="mt-2 p-2 bg-gray-900 text-green-400 rounded text-xs font-mono whitespace-pre-wrap max-w-md overflow-x-auto">
                        <div className="text-gray-500 mb-1">BEFORE:</div>
                        {log.before_json || 'null'}
                        <div className="text-gray-500 my-1 border-t border-gray-700 pt-1">AFTER:</div>
                        {log.after_json || 'null'}
                      </div>
                    </details>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  } catch (error) {
    console.error("Error loading audit logs:", error);
    return (
      <div className="p-8 text-center text-red-600">
        Error loading audit logs.
      </div>
    );
  }
}