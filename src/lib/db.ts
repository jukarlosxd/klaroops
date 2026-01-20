// Mock DB for Vercel Deployment
// better-sqlite3 does not work in Vercel Serverless environment (ephemeral FS + build issues).
// Switching to In-Memory DB for MVP/Demo purposes.

export interface Client {
  id: string;
  name: string;
  template_id: string;
  spreadsheet_id: string;
  last_sync: string | null;
}

export interface RawEvent {
  id: number;
  client_id: string;
  timestamp: string;
  location: string;
  area: string;
  asset_id: string;
  status: string;
  note: string;
  raw_data: string;
}

// Global cache to survive some reloads in dev, but will reset in serverless
declare global {
  var _mockDb: {
    clients: Client[];
    events: RawEvent[];
  } | undefined;
}

const db = global._mockDb || {
  clients: [],
  events: []
};

if (process.env.NODE_ENV !== 'production') {
  global._mockDb = db;
}

export const getClients = (): Client[] => {
  return db.clients;
};

export const getClient = (id: string): Client | undefined => {
  return db.clients.find(c => c.id === id);
};

export const createClient = (client: Client) => {
  db.clients.push(client);
};

export const updateClientSync = (id: string, timestamp: string) => {
  const client = db.clients.find(c => c.id === id);
  if (client) client.last_sync = timestamp;
};

export const clearClientEvents = (clientId: string) => {
  db.events = db.events.filter(e => e.client_id !== clientId);
};

export const insertEvents = (events: Omit<RawEvent, 'id'>[]) => {
  let lastId = db.events.length > 0 ? Math.max(...db.events.map(e => e.id)) : 0;
  events.forEach(e => {
    lastId++;
    db.events.push({ ...e, id: lastId });
  });
};

export const getClientEvents = (clientId: string): RawEvent[] => {
  return db.events
    .filter(e => e.client_id === clientId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default db;
