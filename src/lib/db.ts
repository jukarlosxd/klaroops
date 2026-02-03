import fs from 'fs';
import path from 'path';
import { Client, ClientConfig, Event } from '@/types/client';

// Import schemas to be used as types (a more advanced setup would generate types from JSON schemas)
import eventSchema from './schemas/event.schema.json';
import clientConfigSchema from './schemas/client-config.schema.json';

// The main database structure, organized by tenant
interface DbData {
  tenants: {
    [tenantId: string]: {
      clients: Client[];
      events: Event[];
    };
  };
}

const dbPath = path.resolve(process.cwd(), 'src', 'lib', 'db.json');

// --- DB Access Functions ---

function readDb(): DbData {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    }
  }
  catch (error) {
    console.error("Error reading or parsing db.json:", error);
  }
  // If file doesn't exist or is corrupt, return a default structure
  return { tenants: {} };
}

function writeDb(data: DbData) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// --- Tenant and Client Functions ---

/**
 * Retrieves all clients for a given tenant.
 * NOTE: In a real multi-tenant app, you would get the tenantId from the user's session.
 */
export const getClientsForTenant = (tenantId: string): Client[] => {
  const db = readDb();
  return db.tenants[tenantId]?.clients || [];
};

/**
 * Retrieves a single client by its ID, ensuring it belongs to the correct tenant.
 */
export const getClient = (tenantId: string, clientId: string): Client | undefined => {
  const clients = getClientsForTenant(tenantId);
  return clients.find(c => c.id === clientId);
};

/**
 * Creates a new client within a tenant.
 */
export const createClient = (tenantId: string, name: string, config: ClientConfig): Client => {
  const db = readDb();
  if (!db.tenants[tenantId]) {
    db.tenants[tenantId] = { clients: [], events: [] };
  }

  const newClient: Client = {
    id: `cli_${crypto.randomUUID()}`,
    tenantId,
    name,
    config,
    createdAt: new Date().toISOString(),
  };

  db.tenants[tenantId].clients.push(newClient);
  writeDb(db);
  return newClient;
};

// --- Event Functions ---

/**
 * Inserts a batch of standardized events for a specific client.
 */
export const insertEvents = (tenantId: string, events: Event[]) => {
  const db = readDb();
  if (!db.tenants[tenantId]) {
    // This should not happen if a client exists, but as a safeguard:
    db.tenants[tenantId] = { clients: [], events: [] };
  }
  db.tenants[tenantId].events.push(...events);
  writeDb(db);
};

/**
 * Retrieves all events for a given client, sorted by time.
 */
export const getClientEvents = (tenantId: string, clientId: string): Event[] => {
  const db = readDb();
  const tenantEvents = db.tenants[tenantId]?.events || [];
  
  // Filter events that belong to the specific client
  return tenantEvents
    .filter(e => e.clientId === clientId)
    .sort((a, b) => new Date(b.time.occurredAt).getTime() - new Date(a.time.occurredAt).getTime());
};

/**
 * Clears all events for a specific client. Useful for re-syncs.
 */
export const clearClientEvents = (tenantId: string, clientId: string) => {
  const db = readDb();
  if (db.tenants[tenantId]) {
    const originalCount = db.tenants[tenantId].events.length;
    db.tenants[tenantId].events = db.tenants[tenantId].events.filter(e => e.clientId !== clientId);
    console.log(`Cleared ${originalCount - db.tenants[tenantId].events.length} events for client ${clientId}`);
    writeDb(db);
  }
};
