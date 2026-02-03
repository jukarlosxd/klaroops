import type { RawEvent } from '@/types/client';
import { formatDistanceToNow } from 'date-fns';

export function BrokenTable({ assets }: { assets: RawEvent[] }) {
  if (assets.length === 0) return null;
  
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">Broken Assets</h3>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500 font-medium">
          <tr>
            <th className="px-6 py-3">Asset ID</th>
            <th className="px-6 py-3">Area</th>
            <th className="px-6 py-3">Issue</th>
            <th className="px-6 py-3">Reported</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {assets.map(asset => (
            <tr key={asset.eventId}>
              <td className="px-6 py-4 font-medium">{asset.payload.asset_id}</td>
              <td className="px-6 py-4">{asset.payload.area}</td>
              <td className="px-6 py-4 text-red-600">{asset.payload.note || 'No details'}</td>
              <td className="px-6 py-4 text-gray-500">{formatDistanceToNow(new Date(asset.time.occurredAt), { addSuffix: true })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
