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

export interface ClientConfig {
  version: string;
  templateId: string;
  dataMapping: Record<string, any>;
  dashboard: {
    layout: string;
    metricIds: string[];
  };
  permissions: {
    admins: string[];
    editors: string[];
    viewers: string[];
  };
  metadata: {
    spreadsheetId: string | null;
  };
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  config: ClientConfig;
  createdAt: string;
}
