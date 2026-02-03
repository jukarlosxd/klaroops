export interface ClientConfig {
  templateId: string;
  metadata: {
    spreadsheetId?: string;
    [key: string]: any;
  };
  dashboard: {
    metricIds: string[];
  };
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  config: ClientConfig;
  createdAt: string;
}

export interface Event {
  eventId: string;
  clientId: string;
  source: string;
  time: {
    occurredAt: string;
    processedAt: string;
  };
  type: string;
  payload: Record<string, any>;
}

export interface RawEvent extends Event {}
