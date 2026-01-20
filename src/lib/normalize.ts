import { RawEvent } from './db';

export function normalizeOpsWalkthrough(rows: any[], clientId: string): Omit<RawEvent, 'id'>[] {
  return rows.map(row => {
    // Check if timestamp exists, if not use current time or skip?
    // Robustness: use current time if missing
    const timestamp = row.timestamp || new Date().toISOString();
    
    return {
      client_id: clientId,
      timestamp: timestamp,
      location: row.location || 'Unknown',
      area: row.area || 'Unknown',
      asset_id: row.asset_id || 'Unknown',
      status: (row.status || 'ok').toLowerCase(),
      note: row.note || '',
      raw_data: JSON.stringify(row)
    };
  });
}
