import { RawEvent } from './db';
import { format, parseISO, isSameDay, subDays, startOfDay } from 'date-fns';

export interface Metrics {
  availabilityToday: number;
  downtimeCount: number;
  brokenCount: number;
  totalAssets: number;
  topProblemAreas: { area: string, count: number }[];
  availabilityTrend: { date: string, availability: number }[];
  brokenAssets: RawEvent[];
}

export function calculateMetrics(events: RawEvent[]): Metrics {
  if (events.length === 0) {
    return {
      availabilityToday: 0,
      downtimeCount: 0,
      brokenCount: 0,
      totalAssets: 0,
      topProblemAreas: [],
      availabilityTrend: [],
      brokenAssets: []
    };
  }

  const today = new Date();
  const todayEvents = events.filter(e => isSameDay(parseISO(e.timestamp), today));
  
  // 1. Availability % (today)
  // Definition: % of checks that are 'ok'.
  const todayTotal = todayEvents.length;
  const todayOk = todayEvents.filter(e => e.status === 'ok').length;
  const availabilityToday = todayTotal > 0 ? Math.round((todayOk / todayTotal) * 100) : 0;

  // 2. Downtime count (down + broken) (Today? Or Latest status?)
  // PRD says: "Downtime count (down + broken)". Usually implies current state or today's incidents.
  // Let's assume today's incidents for now, or maybe current state of unique assets?
  // "Top problem areas (by downtime)" implies count of incidents.
  // "Broken assets (latest status only)" implies current state.
  
  // Let's go with "Incidents Today" for Downtime Count
  const todayDown = todayEvents.filter(e => e.status === 'down' || e.status === 'broken').length;
  const todayBroken = todayEvents.filter(e => e.status === 'broken').length;

  // 3. Top problem areas (by downtime) - All time or recent? Let's use last 7 days.
  const sevenDaysAgo = subDays(today, 7);
  const recentEvents = events.filter(e => parseISO(e.timestamp) >= sevenDaysAgo);
  
  const areaCounts: Record<string, number> = {};
  recentEvents.forEach(e => {
    if (e.status !== 'ok') {
      areaCounts[e.area] = (areaCounts[e.area] || 0) + 1;
    }
  });
  
  const topProblemAreas = Object.entries(areaCounts)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 4. 7-day availability trend
  const availabilityTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const dayEvents = events.filter(e => isSameDay(parseISO(e.timestamp), d));
    const total = dayEvents.length;
    const ok = dayEvents.filter(e => e.status === 'ok').length;
    const val = total > 0 ? Math.round((ok / total) * 100) : 0;
    availabilityTrend.push({
      date: format(d, 'MMM dd'),
      availability: val
    });
  }

  // 5. Broken assets (latest status only)
  // Get latest event per asset
  const latestByAsset = new Map<string, RawEvent>();
  // Events are ordered by timestamp DESC in getClientEvents, but let's be safe
  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  sortedEvents.forEach(e => {
    if (!latestByAsset.has(e.asset_id)) {
      latestByAsset.set(e.asset_id, e);
    }
  });
  
  const brokenAssets = Array.from(latestByAsset.values()).filter(e => e.status === 'broken');

  return {
    availabilityToday,
    downtimeCount: todayDown,
    brokenCount: todayBroken,
    totalAssets: latestByAsset.size,
    topProblemAreas,
    availabilityTrend,
    brokenAssets
  };
}
