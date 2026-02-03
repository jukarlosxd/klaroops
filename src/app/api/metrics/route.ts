import { NextResponse } from 'next/server';
import { getClient, getClientEvents } from '@/lib/db';
import { Event } from '@/types/client';
import metricRegistry from '@/lib/schemas/metric-registry.schema.json';

// Define a type for the metric definitions to avoid using 'any'
interface MetricDefinition {
  id: string;
  calculation: {
    method: string;
    source: {
      id: string;
    };
    params: {
      filters?: any[];
    };
  };
}

const calculateMetricValue = (metricDef: MetricDefinition, events: Event[]): number | string => {
  const { calculation } = metricDef;
  if (calculation.method === 'count') {
    const { filters } = calculation.params;
    let filteredEvents = events;
    if (filters && filters.length > 0) {
      filteredEvents = events.filter(event => {
        return filters.every((filter: any) => {
          const [field, value] = Object.entries(filter)[0];
          return event.payload[field] === value;
        });
      });
    }
    return filteredEvents.length;
  }
  return 'N/A';
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  const tenantId = searchParams.get('tenantId'); // TenantId is now required

  if (!clientId || !tenantId) {
    return NextResponse.json({ error: 'Missing clientId or tenantId' }, { status: 400 });
  }

  const client = getClient(tenantId, clientId);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const events = getClientEvents(tenantId, clientId);
  const calculatedMetrics: { [key: string]: number | string } = {};

  // Get the list of metrics to calculate from the client's own config
  const metricsToCalculate = client.config.dashboard.metricIds;

  metricsToCalculate.forEach(metricId => {
    const metricDefFromRegistry = metricRegistry.metrics.find(m => m.metricId === metricId);
    if (metricDefFromRegistry) {
      // Adapt the object from the registry to our MetricDefinition interface
      const metricDefForCalc: MetricDefinition = {
        id: metricDefFromRegistry.metricId,
        calculation: {
          method: 'count', // Hardcoded for now, as it's all we support
          source: {
            id: metricDefFromRegistry.metricId // Use metricId as the key
          },
          params: {
            // This is a placeholder. A real implementation would parse `formulaRef`
            filters: [] 
          }
        }
      };

      const metricValueKey = metricDefForCalc.calculation.source.id;
      calculatedMetrics[metricValueKey] = calculateMetricValue(metricDefForCalc, events);
    } else {
      console.warn(`Metric ID '${metricId}' from client config not found in registry.`);
    }
  });



  return NextResponse.json(calculatedMetrics);
}
