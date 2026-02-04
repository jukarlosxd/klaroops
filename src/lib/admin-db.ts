import fs from 'fs';
import path from 'path';
import os from 'os';
import { 
    AdminDB, 
    User, 
    Ambassador, 
    AmbassadorApplication,
    Client, 
    Commission, 
    Appointment, 
    AuditLog,
    DashboardProject,
    AIThread,
    AIMessage
  } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Vercel / Production Strategy:
// In production, the filesystem is read-only. We use /tmp which is writable but ephemeral.
// This means data resets on cold starts. This is acceptable for a Demo Deployment.
const DB_PATH = process.env.NODE_ENV === 'production'
  ? path.join(os.tmpdir(), 'admin-store.json')
  : path.join(process.cwd(), 'src', 'lib', 'admin-store.json');

const SOURCE_PATH = path.join(process.cwd(), 'src', 'lib', 'admin-store.json');

// --- Core DB Logic ---

function readDB(): AdminDB {
  // If in production and DB doesn't exist in /tmp yet, try to seed it from source file
  if (process.env.NODE_ENV === 'production' && !fs.existsSync(DB_PATH) && fs.existsSync(SOURCE_PATH)) {
    try {
      const initialData = fs.readFileSync(SOURCE_PATH);
      fs.writeFileSync(DB_PATH, initialData);
      console.log('Seeded /tmp DB from source');
    } catch (e) {
      console.error('Failed to seed /tmp DB', e);
    }
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialDB: AdminDB = {
      users: [],
      ambassadors: [],
      ambassador_applications: [],
      clients: [],
      client_users: [],
      commissions: [],
      appointments: [],
      audit_logs: [],
      dashboard_projects: [],
      ai_threads: [],
      ai_messages: []
    };
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
    } catch (e) {
        // Fallback for extreme cases where even /tmp fails
        console.error('Critical: Cannot write to DB path', e);
    }
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(data);
    // Migration: ensure arrays exist
    if (!db.users) db.users = [];
    if (!db.ambassadors) db.ambassadors = [];
    if (!db.clients) db.clients = [];
    if (!db.commissions) db.commissions = [];
    if (!db.appointments) db.appointments = [];
    if (!db.audit_logs) db.audit_logs = [];
    if (!db.dashboard_projects) db.dashboard_projects = [];
    if (!db.ai_threads) db.ai_threads = [];
    if (!db.ai_messages) db.ai_messages = [];
    if (!db.client_users) db.client_users = [];
    if (!db.ambassador_applications) db.ambassador_applications = [];
    return db;
  } catch (error) {
    console.error("Error reading DB, returning empty", error);
    return { 
      users: [], 
      ambassadors: [], 
      ambassador_applications: [],
      clients: [], 
      client_users: [],
      commissions: [], 
      appointments: [], 
      audit_logs: [],
      dashboard_projects: [],
      ai_threads: [],
      ai_messages: []
    };
  }
}

function writeDB(data: AdminDB) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing DB (persistence failed):', e);
  }
}

// --- Audit Helper ---

function logAudit(
  db: AdminDB, 
  actorId: string, 
  action: string, 
  entityType: string, 
  entityId: string, 
  before: any, 
  after: any
) {
  const log: AuditLog = {
    id: uuidv4(),
    actor_user_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    before_json: before ? JSON.stringify(before) : null,
    after_json: after ? JSON.stringify(after) : null,
    created_at: new Date().toISOString()
  };
  db.audit_logs.unshift(log); 
}

// --- Users ---

export const getUserByEmail = async (email: string) => {
  const db = readDB();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const getUserById = async (id: string) => {
  const db = readDB();
  return db.users.find(u => u.id === id) || null;
};

// --- Ambassadors ---

export const getAmbassadors = async () => {
  const db = readDB();
  // Join user data
  return db.ambassadors.map(amb => {
    const user = db.users.find(u => u.id === amb.user_id);
    return {
      ...amb,
      email: user ? user.email : 'unknown' // Hydrate email from user
    };
  });
};

export const getAmbassadorById = async (id: string) => {
  const db = readDB();
  const amb = db.ambassadors.find(a => a.id === id);
  if (!amb) return null;
  
  const user = db.users.find(u => u.id === amb.user_id);
  return {
    ...amb,
    email: user ? user.email : 'unknown'
  };
};

export const getAmbassadorByUserId = async (userId: string) => {
  const db = readDB();
  return db.ambassadors.find(a => a.user_id === userId) || null;
};

// TRANSACTIONAL CREATE
export const createAmbassador = async (
  data: { name: string, email: string, password?: string, status: 'active' | 'inactive', commission_rule_json: string }, 
  actorId: string
) => {
  const db = readDB();
  const emailNormalized = data.email.trim().toLowerCase();

  // 1. Check User Uniqueness
  if (db.users.some(u => u.email.toLowerCase() === emailNormalized)) {
    throw new Error('Email already registered');
  }

  // 2. Hash Password
  if (!data.password) throw new Error('Password required');
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(data.password, salt);

  // 3. Create User
  const newUser: User = {
    id: uuidv4(),
    email: emailNormalized,
    password_hash,
    role: 'ambassador',
    created_at: new Date().toISOString()
  };
  db.users.push(newUser);

  // 4. Create Ambassador Linked to User
  const newAmbassador: Ambassador = {
    id: uuidv4(),
    user_id: newUser.id,
    name: data.name,
    status: data.status,
    commission_rule_json: data.commission_rule_json,
    created_at: new Date().toISOString()
  };
  db.ambassadors.push(newAmbassador);

  // 5. Audit
  logAudit(db, actorId, 'CREATE', 'user', newUser.id, null, { email: newUser.email, role: newUser.role });
  logAudit(db, actorId, 'CREATE', 'ambassador', newAmbassador.id, null, newAmbassador);

  writeDB(db);
  
  return { ...newAmbassador, email: newUser.email };
};

export const updateAmbassador = async (id: string, data: Partial<Ambassador> & { password?: string }, actorId: string) => {
  const db = readDB();
  const index = db.ambassadors.findIndex(a => a.id === id);
  if (index === -1) return null;

  const oldData = { ...db.ambassadors[index] };
  
  // Handle password update on User entity
  if (data.password) {
     const userIndex = db.users.findIndex(u => u.id === oldData.user_id);
     if (userIndex !== -1) {
         const salt = await bcrypt.genSalt(10);
         const newHash = await bcrypt.hash(data.password, salt);
         db.users[userIndex].password_hash = newHash;
         logAudit(db, actorId, 'UPDATE_PASSWORD', 'user', db.users[userIndex].id, null, null);
     }
  }

  // Update Ambassador fields
  const { password, ...ambassadorFields } = data; // Remove password from ambassador update
  const newData = { ...oldData, ...ambassadorFields };
  
  db.ambassadors[index] = newData;
  logAudit(db, actorId, 'UPDATE', 'ambassador', id, oldData, newData);
  
  writeDB(db);
  return newData;
};

// TRANSACTIONAL DELETE
export const deleteAmbassador = async (id: string, actorId: string) => {
  const db = readDB();
  const ambIndex = db.ambassadors.findIndex(a => a.id === id);
  if (ambIndex === -1) return null;

  const ambassador = db.ambassadors[ambIndex];
  
  // 1. Remove Ambassador
  db.ambassadors.splice(ambIndex, 1);
  logAudit(db, actorId, 'DELETE', 'ambassador', id, ambassador, null);

  // 2. Remove Linked User
  const userIndex = db.users.findIndex(u => u.id === ambassador.user_id);
  if (userIndex !== -1) {
    const user = db.users[userIndex];
    db.users.splice(userIndex, 1);
    logAudit(db, actorId, 'DELETE', 'user', user.id, user, null);
  }

  // 3. Unassign Clients
  db.clients.forEach(c => {
    if (c.ambassador_id === id) {
      c.ambassador_id = null;
      // We could log individual client updates but it might spam the log
    }
  });

  writeDB(db);
  return true;
};

export const createAmbassadorApplication = async (data: Omit<AmbassadorApplication, 'id' | 'created_at' | 'status'>, ip: string, userAgent: string) => {
  const db = readDB();
  const newApp: AmbassadorApplication = {
    id: uuidv4(),
    ...data,
    status: 'new',
    ip_address: ip,
    user_agent: userAgent,
    created_at: new Date().toISOString()
  };
  db.ambassador_applications.unshift(newApp);
  writeDB(db);
  return newApp;
};

export const getAmbassadorApplications = async () => {
  const db = readDB();
  return db.ambassador_applications;
};

export const updateAmbassadorApplicationStatus = async (id: string, status: AmbassadorApplication['status'], actorId: string, notes?: string) => {
  const db = readDB();
  const index = db.ambassador_applications.findIndex(a => a.id === id);
  if (index === -1) return null;

  const oldData = { ...db.ambassador_applications[index] };
  const newData = { 
      ...oldData, 
      status, 
      notes_internal: notes ?? oldData.notes_internal,
      updated_at: new Date().toISOString() 
  };
  
  db.ambassador_applications[index] = newData;
  logAudit(db, actorId, 'UPDATE_STATUS', 'ambassador_application', id, oldData, newData);
  writeDB(db);
  return newData;
};

export const getAmbassadorApplicationStats = async () => {
  const db = readDB();
  const apps = db.ambassador_applications;
  const now = new Date();
  
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
  const yesterdayEnd = todayStart;
  
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const prevWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  
  const newToday = apps.filter(a => a.created_at >= todayStart && a.status === 'new').length;
  const newYesterday = apps.filter(a => a.created_at >= yesterdayStart && a.created_at < yesterdayEnd && a.status === 'new').length;
  
  const totalLast7Days = apps.filter(a => a.created_at >= weekStart).length;
  const totalPrev7Days = apps.filter(a => a.created_at >= prevWeekStart && a.created_at < weekStart).length;

  // Calculate Deltas
  const deltaToday = newToday - newYesterday;
  const deltaWeekly = totalLast7Days - totalPrev7Days;
  const deltaWeeklyPercent = totalPrev7Days === 0 ? 100 : Math.round(((totalLast7Days - totalPrev7Days) / totalPrev7Days) * 100);

  return {
      newToday,
      newYesterday,
      totalLast7Days,
      deltaToday,
      deltaWeekly,
      deltaWeeklyPercent,
      totalNew: apps.filter(a => a.status === 'new').length
  };
};

// --- Clients ---

export const getClients = async () => {
  const db = readDB();
  return db.clients;
};

export const getClientsByAmbassador = async (ambassadorId: string) => {
  const db = readDB();
  return db.clients.filter(c => c.ambassador_id === ambassadorId);
};

export const getClientById = async (id: string) => {
  const db = readDB();
  return db.clients.find(c => c.id === id) || null;
};

export const updateClient = async (id: string, data: Partial<Client>, actorId: string) => {
  const db = readDB();
  const index = db.clients.findIndex(c => c.id === id);
  if (index === -1) return null;

  const oldData = { ...db.clients[index] };
  const newData = { ...oldData, ...data };

  db.clients[index] = newData;
  logAudit(db, actorId, 'UPDATE', 'client', id, oldData, newData);
  writeDB(db);
  return newData;
};

export const getClientByUserId = async (userId: string) => {
  const db = readDB();
  const relation = db.client_users.find(cu => cu.user_id === userId);
  if (!relation) return null;
  return db.clients.find(c => c.id === relation.client_id) || null;
};

export const createClient = async (
    data: Omit<Client, 'id' | 'created_at' | 'last_activity_at'> & { 
        login_email?: string, 
        login_password?: string 
    }, 
    actorId: string
) => {
  const db = readDB();
  
  // 1. If login credentials provided, create User first
  let newUserId = null;
  if (data.login_email && data.login_password) {
      const emailNorm = data.login_email.trim().toLowerCase();
      if (db.users.some(u => u.email.toLowerCase() === emailNorm)) {
          throw new Error('Client Login Email already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(data.login_password, salt);
      
      const newUser: User = {
          id: uuidv4(),
          email: emailNorm,
          password_hash: hash,
          role: 'client_user',
          created_at: new Date().toISOString()
      };
      db.users.push(newUser);
      newUserId = newUser.id;
      logAudit(db, actorId, 'CREATE', 'user', newUser.id, null, { email: newUser.email, role: 'client_user' });
  }

  // 2. Create Client
  const { login_email, login_password, ...clientData } = data; // Remove login props from client data
  
  const newClient: Client = {
    id: uuidv4(),
    ...clientData,
    created_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString()
  };
  db.clients.push(newClient);

  // 3. Link User to Client
  if (newUserId) {
      db.client_users.push({
          id: uuidv4(),
          user_id: newUserId,
          client_id: newClient.id,
          created_at: new Date().toISOString()
      });
  }

  logAudit(db, actorId, 'CREATE', 'client', newClient.id, null, newClient);
  writeDB(db);
  return newClient;
};

export const assignClientToAmbassador = async (clientId: string, ambassadorId: string | null, actorId: string) => {
  const db = readDB();
  const index = db.clients.findIndex(c => c.id === clientId);
  if (index === -1) return null;

  const oldData = { ...db.clients[index] };
  
  if (ambassadorId) {
      // Validate ambassador exists
      const amb = db.ambassadors.find(a => a.id === ambassadorId);
      if (!amb) throw new Error('Ambassador not found');
      if (amb.status !== 'active') throw new Error('Ambassador is not active');
  }

  const newData = { 
      ...oldData, 
      ambassador_id: ambassadorId,
      updated_at: new Date().toISOString()
  };

  db.clients[index] = newData;
  
  const action = ambassadorId ? 'ASSIGN_AMBASSADOR' : 'UNASSIGN_AMBASSADOR';
  logAudit(db, actorId, action, 'client', clientId, oldData, newData);
  
  writeDB(db);
  return newData;
};

// --- Dashboard Projects ---

export const getDashboardProject = async (clientId: string) => {
  const db = readDB();
  return db.dashboard_projects.find(p => p.client_id === clientId) || null;
};

export const upsertDashboardProject = async (
  clientId: string, 
  data: Partial<Omit<DashboardProject, 'id' | 'client_id' | 'created_at' | 'updated_at'>>, 
  actorId: string
) => {
  const db = readDB();
  const existingIndex = db.dashboard_projects.findIndex(p => p.client_id === clientId);
  
  if (existingIndex !== -1) {
    // Update
    const oldData = { ...db.dashboard_projects[existingIndex] };
    const newData = { 
      ...oldData, 
      ...data, 
      updated_at: new Date().toISOString() 
    };
    db.dashboard_projects[existingIndex] = newData;
    logAudit(db, actorId, 'UPDATE', 'dashboard_project', oldData.id, oldData, newData);
    writeDB(db);
    return newData;
  } else {
    // Create
    const newProject: DashboardProject = {
      id: uuidv4(),
      client_id: clientId,
      template_key: 'default',
      data_source_type: 'manual',
      data_source_config_json: '{}',
      mapping_json: '{}',
      kpi_rules_json: '{}',
      dashboard_status: 'not_started',
      ...data, // Override defaults
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.dashboard_projects.push(newProject);
    logAudit(db, actorId, 'CREATE', 'dashboard_project', newProject.id, null, newProject);
    writeDB(db);
    return newProject;
  }
};

// --- AI Threads ---

export const getAIThreads = async (clientId: string) => {
  const db = readDB();
  return db.ai_threads.filter(t => t.client_id === clientId).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
};

export const createAIThread = async (clientId: string, title: string, actorId: string) => {
  const db = readDB();
  const thread: AIThread = {
    id: uuidv4(),
    client_id: clientId,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.ai_threads.push(thread);
  logAudit(db, actorId, 'CREATE', 'ai_thread', thread.id, null, thread);
  writeDB(db);
  return thread;
};

export const getAIMessages = async (threadId: string) => {
  const db = readDB();
  return db.ai_messages.filter(m => m.thread_id === threadId).sort((a, b) => a.created_at.localeCompare(b.created_at));
};

export const addAIMessage = async (threadId: string, role: 'user' | 'assistant' | 'system', content: string) => {
  const db = readDB();
  const msg: AIMessage = {
    id: uuidv4(),
    thread_id: threadId,
    role,
    content,
    created_at: new Date().toISOString()
  };
  db.ai_messages.push(msg);
  
  // Update thread timestamp
  const threadIndex = db.ai_threads.findIndex(t => t.id === threadId);
  if (threadIndex !== -1) {
    db.ai_threads[threadIndex].updated_at = msg.created_at;
  }
  
  writeDB(db);
  return msg;
};

// --- Commissions ---

export const getCommissions = async () => {
  const db = readDB();
  return db.commissions;
};

export const createCommission = async (data: Omit<Commission, 'id' | 'created_at'>, actorId: string) => {
  const db = readDB();
  const newComm: Commission = {
    id: uuidv4(),
    ...data,
    created_at: new Date().toISOString()
  };
  db.commissions.push(newComm);
  logAudit(db, actorId, 'CREATE', 'commission', newComm.id, null, newComm);
  writeDB(db);
  return newComm;
};

export const updateCommission = async (id: string, data: Partial<Commission>, actorId: string) => {
  const db = readDB();
  const index = db.commissions.findIndex(c => c.id === id);
  if (index === -1) return null;

  const oldData = { ...db.commissions[index] };
  const newData = { ...oldData, ...data };

  db.commissions[index] = newData;
  logAudit(db, actorId, 'UPDATE', 'commission', id, oldData, newData);
  writeDB(db);
  return newData;
};

export const deleteCommission = async (id: string, actorId: string) => {
  const db = readDB();
  const index = db.commissions.findIndex(c => c.id === id);
  if (index === -1) return null;

  const commission = db.commissions[index];
  db.commissions.splice(index, 1);
  logAudit(db, actorId, 'DELETE', 'commission', id, commission, null);
  
  writeDB(db);
  return true;
};

// --- Appointments ---

export const getAppointments = async (ambassadorId: string, startDate?: string, endDate?: string) => {
  const db = readDB();
  // Filter by ambassadorId
  let apps = db.appointments.filter(a => a.ambassador_id === ambassadorId);

  if (startDate) {
    apps = apps.filter(a => a.start_at >= startDate);
  }
  if (endDate) {
    apps = apps.filter(a => a.start_at <= endDate);
  }

  return apps;
};

export const getAppointmentById = async (id: string) => {
  const db = readDB();
  return db.appointments.find(a => a.id === id) || null;
};

export const createAppointment = async (
    ambassadorId: string, 
    data: Omit<Appointment, 'id' | 'ambassador_id'>, 
    actorId?: string // Optional, defaults to ambassadorId if not provided
) => {
  const db = readDB();
  const newAppt: Appointment = {
    id: uuidv4(),
    ambassador_id: ambassadorId,
    ...data
  };
  db.appointments.push(newAppt);
  
  // Audit log (using actorId or ambassadorId)
  logAudit(db, actorId || ambassadorId, 'CREATE', 'appointment', newAppt.id, null, newAppt);
  
  writeDB(db);
  return newAppt;
};

export const updateAppointment = async (id: string, data: Partial<Appointment>, actorId: string) => {
  const db = readDB();
  const index = db.appointments.findIndex(a => a.id === id);
  if (index === -1) return null;

  const oldData = { ...db.appointments[index] };
  const newData = { ...oldData, ...data };

  db.appointments[index] = newData;
  logAudit(db, actorId, 'UPDATE', 'appointment', id, oldData, newData);
  writeDB(db);
  return newData;
};

export const deleteAppointment = async (id: string, actorId: string) => {
  const db = readDB();
  const index = db.appointments.findIndex(a => a.id === id);
  if (index === -1) return null;

  const appt = db.appointments[index];
  db.appointments.splice(index, 1);
  logAudit(db, actorId, 'DELETE', 'appointment', id, appt, null);
  
  writeDB(db);
  return true;
};

// --- Audit ---

export const getAuditLogs = async () => {
  const db = readDB();
  return db.audit_logs;
};

// --- Seeding ---

export const seedData = async () => {
  const demoSalt = await bcrypt.genSalt(10);
  const demoHash = await bcrypt.hash('123456', demoSalt);

  // 1. Create Users
  const users: User[] = [
      { id: 'user_amb_1', email: 'carlos@demo.com', password_hash: demoHash, role: 'ambassador', created_at: new Date().toISOString() },
      { id: 'user_amb_2', email: 'maria@demo.com', password_hash: demoHash, role: 'ambassador', created_at: new Date().toISOString() }
  ];

  // 2. Create Ambassadors linked to Users
  const ambassadors: Ambassador[] = [
    { id: 'amb_1', user_id: 'user_amb_1', name: 'Carlos Rodriguez', status: 'active', commission_rule_json: '{"rate": 0.10}', created_at: new Date().toISOString(), last_login_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'amb_2', user_id: 'user_amb_2', name: 'Maria Garcia', status: 'active', commission_rule_json: '{"rate": 0.15}', created_at: new Date().toISOString(), last_login_at: new Date(Date.now() - 172800000).toISOString() },
  ];

  const db: AdminDB = {
    users,
    ambassadors,
    clients: [
      { id: 'cli_1', name: 'Fabrica Textil Apex', status: 'active', ambassador_id: 'amb_1', created_at: new Date().toISOString(), last_activity_at: new Date().toISOString() },
      { id: 'cli_2', name: 'Manufacturas del Norte', status: 'paused', ambassador_id: 'amb_1', created_at: new Date().toISOString(), last_activity_at: new Date().toISOString() },
      { id: 'cli_3', name: 'Plásticos Industriales', status: 'active', ambassador_id: 'amb_2', created_at: new Date().toISOString(), last_activity_at: new Date().toISOString() },
      { id: 'cli_4', name: 'Cliente Nuevo Sin Asignar', status: 'active', ambassador_id: null, created_at: new Date().toISOString(), last_activity_at: new Date().toISOString() },
    ],
    commissions: [
      { id: 'com_1', ambassador_id: 'amb_1', client_id: 'cli_1', amount_cents: 150000, status: 'paid', period_start: '2024-01-01', period_end: '2024-01-31', created_at: new Date().toISOString(), note: 'Enero 2024 Commission' },
      { id: 'com_2', ambassador_id: 'amb_1', client_id: 'cli_1', amount_cents: 120000, status: 'pending', period_start: '2024-02-01', period_end: '2024-02-29', created_at: new Date().toISOString(), note: 'Febrero 2024 Commission' },
    ],
    appointments: [
      { id: 'apt_1', ambassador_id: 'amb_1', client_id: 'cli_1', title: 'Revisión Mensual', start_at: new Date(Date.now() + 86400000).toISOString(), end_at: new Date(Date.now() + 90000000).toISOString(), status: 'scheduled', notes: 'Revisar KPIs' }
    ],
    audit_logs: [
      { id: 'log_1', actor_user_id: 'system', action: 'SEED', entity_type: 'system', entity_id: 'root', before_json: null, after_json: '{"status": "seeded"}', created_at: new Date().toISOString() }
    ],
    dashboard_projects: [],
    ai_threads: [],
    ai_messages: [],
    client_users: []
  };
  writeDB(db);
  return true;
};

// --- Stats ---

export const getAdminStats = async () => {
  const db = readDB();
  return {
    totalAmbassadors: db.ambassadors.filter(a => a.status === 'active').length,
    totalClients: db.clients.filter(c => c.status === 'active').length,
    leadsThisMonth: 0, // Placeholder
    pendingCommissions: db.commissions.filter(c => c.status === 'pending').reduce((s, c) => s + (c.amount_cents / 100), 0),
    paidCommissions: db.commissions.filter(c => c.status === 'paid').reduce((s, c) => s + (c.amount_cents / 100), 0),
  };
};
