import { RawEvent } from '@/types/client';

export function normalizeOpsWalkthrough(rows: any[], clientId: string): RawEvent[] {
  return rows.map(row => {
    // Check if timestamp exists, if not use current time or skip?
    // Robustness: use current time if missing
    const timestamp = row.timestamp || new Date().toISOString();
    
    return {
      eventId: `evt_${Math.random().toString(36).substr(2, 9)}`,
      clientId: clientId,
      source: 'google_sheets',
      time: {
        occurredAt: timestamp,
        processedAt: new Date().toISOString()
      },
      type: 'ops_walkthrough_log',
      payload: {
        location: row.location || 'Unknown',
        area: row.area || 'Unknown',
        asset_id: row.asset_id || 'Unknown',
        status: (row.status || 'ok').toLowerCase(),
        note: row.note || '',
        raw_data: JSON.stringify(row)
      }
    };
  });
}
