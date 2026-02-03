import fs from 'fs';
import path from 'path';

// --- Types ---

export type UserRole = 'admin' | 'ambassador';

export type ClientStatus = 'active' | 'paused' | 'cancelled';
export type LeadStatus = 'new' | 'contacted' | 'booked' | 'won' | 'lost';
export type CommissionStatus = 'pending' | 'paid' | 'reversed';
export type AppointmentStatus = 'scheduled' | 'done' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface AmbassadorClient {
  id: string;
  ambassadorId: string; // Multi-tenant link
  name: string;
  status: ClientStatus;
  createdAt: string;
}

export interface Lead {
  id: string;
  ambassadorId: string; // Multi-tenant link
  name: string;
  email: string;
  status: LeadStatus;
  createdAt: string;
}

export interface Commission {
  id: string;
  ambassadorId: string; // Multi-tenant link
  amount: number;
  status: CommissionStatus;
  createdAt: string;
}

export interface Appointment {
  id: string;
  ambassadorId: string; // Multi-tenant link
  title: string;
  clientId: string | null; 
  clientName?: string; 
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface AmbassadorData {
  users: User[];
  clients: AmbassadorClient[];
  leads: Lead[];
  commissions: Commission[];
  appointments: Appointment[];
  auditLogs: AuditLog[];
}

// --- DB Handling ---

const DB_PATH = path.resolve(process.cwd(), 'src', 'lib', 'ambassador-db.json');

function readDb(): AmbassadorData {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      // Migration check: ensure new fields exist
      if (!data.auditLogs) data.auditLogs = [];
      if (!data.users) data.users = [];
      return data;
    }
  } catch (error) {
    console.error("Error reading ambassador-db.json:", error);
  }
  return seedDb(); // Default seed if empty
}

function writeDb(data: AmbassadorData) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Seeding ---

function seedDb(): AmbassadorData {
  // Empty seed as requested by user ("coloca como todos esos numeros abiertso")
  // Only create the admin user if needed, but usually auth handles that dynamically.
  // For safety, we return empty arrays so everything starts clean.
  
  const data: AmbassadorData = {
    users: [],
    clients: [],
    leads: [],
    commissions: [],
    appointments: [],
    auditLogs: []
  };
  
  // Ensure directory exists
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  
  writeDb(data);
  return data;
}

// --- Public API ---

// Admin: Get Global Stats
export const getAdminStats = () => {
  const db = readDb();
  return {
    totalAmbassadors: db.users.filter(u => u.role === 'ambassador').length,
    totalClients: db.clients.filter(c => c.status === 'active').length,
    leadsThisMonth: db.leads.length, // Simplified for now
    pendingCommissions: db.commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0),
    paidCommissions: db.commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0),
  };
};

import { getClientsByAmbassador, getCommissions, getAuditLogs } from './admin-db';

// ... (existing types) ...

// Ambassador: Get Stats (Filtered by Ambassador ID)
// NOW USING ADMIN-DB AS SOURCE OF TRUTH
export const getDashboardData = async (ambassadorId: string) => {
  // 1. Get Clients
  const myClients = await getClientsByAmbassador(ambassadorId);
  
  // 2. Get Commissions
  const allCommissions = await getCommissions();
  const myCommissions = allCommissions.filter(c => c.ambassador_id === ambassadorId);
  
  // 3. Get Logs
  const allLogs = await getAuditLogs();
  const myLogs = allLogs.filter(l => 
    l.actor_user_id === ambassadorId || // Actions I did
    (l.entity_type === 'ambassador' && l.entity_id === ambassadorId) // Actions done to me
  );

  // KPIs
  const activeClients = myClients.filter(c => c.status === 'active').length;
  // Note: Leads are not yet in admin-db, so we return 0 or implement leads table there later
  const totalLeads = 0; 
  const conversionRate = 0;
  
  const totalCommissions = myCommissions
    .filter(c => c.status === 'paid') // Only count paid commissions in total
    .reduce((sum, c) => sum + (c.amount_cents / 100), 0);

  return {
    kpis: {
      activeClients,
      totalLeads,
      conversionRate,
      totalCommissions
    },
    recentActivity: myLogs.slice(0, 10).map(log => ({
       id: log.id,
       type: 'info',
       message: `${log.action} - ${log.entity_type}`,
       createdAt: log.created_at
    }))
  };
};

export const getAppointments = (ambassadorId: string, startDate?: string, endDate?: string) => {
  const db = readDb();
  let apps = db.appointments.filter(a => a.ambassadorId === ambassadorId);
  
  if (startDate) {
    apps = apps.filter(a => a.startAt >= startDate);
  }
  if (endDate) {
    apps = apps.filter(a => a.startAt <= endDate);
  }
  
  return apps.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
};

export const createAppointment = (ambassadorId: string, appt: Omit<Appointment, 'id' | 'ambassadorId'>) => {
  const db = readDb();
  const newAppt: Appointment = { 
    ...appt, 
    id: `apt_${Date.now()}`,
    ambassadorId 
  };
  db.appointments.push(newAppt);
  
  // Add audit log
  db.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: ambassadorId,
    action: `Cita programada: ${appt.title}`,
    details: JSON.stringify(appt),
    createdAt: new Date().toISOString()
  });
  
  writeDb(db);
  return newAppt;
};

export const updateAppointment = (ambassadorId: string, id: string, updates: Partial<Appointment>) => {
  const db = readDb();
  const idx = db.appointments.findIndex(a => a.id === id && a.ambassadorId === ambassadorId);
  if (idx === -1) return null;
  
  db.appointments[idx] = { ...db.appointments[idx], ...updates };
  writeDb(db);
  return db.appointments[idx];
};

export const deleteAppointment = (ambassadorId: string, id: string) => {
  const db = readDb();
  db.appointments = db.appointments.filter(a => !(a.id === id && a.ambassadorId === ambassadorId));
  writeDb(db);
};
