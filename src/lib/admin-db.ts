// Vercel / Production Strategy:
// We have migrated to Supabase. This file is now a wrapper around Supabase calls.
// The JSON DB logic is kept as a fallback or for local dev without Supabase, 
// but for production, we prioritize Supabase.

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
import { supabase } from '@/lib/supabase';

// --- Core DB Logic (Legacy Wrapper) ---

// --- Users ---

export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email)
    .single();
    
  if (error && error.code !== 'PGRST116') console.error('Supabase GetUser Error:', error);
  return data as User | null;
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return null;
  return data as User | null;
};

// --- Ambassadors ---

export const getAmbassadors = async () => {
  // Join user data
  const { data, error } = await supabase
    .from('ambassadors')
    .select(`
      *,
      users ( email )
    `);

  if (error) {
    console.error('Supabase GetAmbassadors Error:', error);
    return [];
  }

  return data.map((amb: any) => ({
    ...amb,
    email: amb.users?.email || 'unknown'
  }));
};

export const getAmbassadorById = async (id: string) => {
  const { data, error } = await supabase
    .from('ambassadors')
    .select(`
      *,
      users ( email )
    `)
    .eq('id', id)
    .single();

  if (error) return null;

  return {
    ...data,
    email: (data as any).users?.email || 'unknown'
  } as unknown as Ambassador;
};

export const getAmbassadorByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('ambassadors')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) return null;
  return data as Ambassador;
};

// TRANSACTIONAL CREATE
export const createAmbassador = async (
  data: { name: string, email: string, password?: string, status: 'active' | 'inactive', commission_rule_json: string }, 
  actorId: string
) => {
  const emailNormalized = data.email.trim().toLowerCase();

  // 1. Check User Uniqueness
  const existingUser = await getUserByEmail(emailNormalized);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // 2. Hash Password
  if (!data.password) throw new Error('Password required');
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(data.password, salt);

  // 3. Create User
  const userId = uuidv4();
  const { error: userError } = await supabase.from('users').insert({
    id: userId,
    email: emailNormalized,
    password_hash,
    role: 'ambassador'
  });

  if (userError) throw new Error('Failed to create user: ' + userError.message);

  // 4. Create Ambassador Linked to User
  const ambassadorId = uuidv4();
  const { data: newAmb, error: ambError } = await supabase.from('ambassadors').insert({
    id: ambassadorId,
    user_id: userId,
    name: data.name,
    status: data.status,
    commission_rule_json: data.commission_rule_json
  }).select().single();

  if (ambError) throw new Error('Failed to create ambassador: ' + ambError.message);

  // 5. Audit
  await logAuditSupabase(actorId, 'CREATE', 'ambassador', ambassadorId, null, newAmb);

  return { ...newAmb, email: emailNormalized } as Ambassador;
};

export const updateAmbassador = async (id: string, data: Partial<Ambassador> & { password?: string }, actorId: string) => {
  // Handle password update on User entity
  if (data.password) {
     const amb = await getAmbassadorById(id);
     if (amb) {
         const salt = await bcrypt.genSalt(10);
         const newHash = await bcrypt.hash(data.password, salt);
         await supabase.from('users').update({ password_hash: newHash }).eq('id', amb.user_id);
         await logAuditSupabase(actorId, 'UPDATE_PASSWORD', 'user', amb.user_id, null, null);
     }
  }

  // Update Ambassador fields
  const { password, ...ambassadorFields } = data; // Remove password from ambassador update
  
  const { data: updated, error } = await supabase
    .from('ambassadors')
    .update(ambassadorFields)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  
  await logAuditSupabase(actorId, 'UPDATE', 'ambassador', id, null, updated);
  return updated as Ambassador;
};

// TRANSACTIONAL DELETE
export const deleteAmbassador = async (id: string, actorId: string) => {
  const amb = await getAmbassadorById(id);
  if (!amb) return null;

  // Cascade delete in Postgres handles most, but let's be explicit for audit
  await supabase.from('ambassadors').delete().eq('id', id);
  await supabase.from('users').delete().eq('id', amb.user_id);
  
  await logAuditSupabase(actorId, 'DELETE', 'ambassador', id, amb, null);
  return true;
};

// --- Ambassador Applications ---

export const createAmbassadorApplication = async (data: Omit<AmbassadorApplication, 'id' | 'created_at' | 'status'>, ip: string, userAgent: string) => {
  // Supabase Implementation
  const { data: newApp, error } = await supabase
    .from('ambassador_applications')
    .insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      city_state: data.city_state,
      message: data.message,
      status: 'new',
      ip_address: ip,
      user_agent: userAgent,
      notes_internal: data.notes_internal
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase Create Application Error:', error);
    throw new Error(error.message);
  }
  
  return newApp as AmbassadorApplication;
};

export const getAmbassadorApplications = async () => {
  // Supabase Implementation
  const { data, error } = await supabase
    .from('ambassador_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase Get Applications Error:', error);
    return [];
  }

  return data as AmbassadorApplication[];
};

export const updateAmbassadorApplicationStatus = async (id: string, status: AmbassadorApplication['status'], actorId: string, notes?: string) => {
  // Supabase Implementation
  const updates: any = { 
    status, 
    updated_at: new Date().toISOString() 
  };
  if (notes !== undefined) {
    updates.notes_internal = notes;
  }

  const { data, error } = await supabase
    .from('ambassador_applications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase Update Application Error:', error);
    return null;
  }

  return data as AmbassadorApplication;
};

export const getAmbassadorApplicationStats = async () => {
  // Supabase Implementation - Hybrid Approach (Fetch recent to compute stats)
  // For scalability, this should be a stored procedure or multiple count queries, 
  // but for MVP, fetching last 30 days is fine.
  
  const now = new Date();
  const prevWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: apps, error } = await supabase
    .from('ambassador_applications')
    .select('id, status, created_at')
    .gte('created_at', prevWeekStart); // Optimization: only fetch needed rows

  if (error || !apps) {
      console.error('Stats Error:', error);
      return null;
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
  const yesterdayEnd = todayStart;
  
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const newToday = apps.filter(a => a.created_at >= todayStart && a.status === 'new').length;
  const newYesterday = apps.filter(a => a.created_at >= yesterdayStart && a.created_at < yesterdayEnd && a.status === 'new').length;
  
  const totalLast7Days = apps.filter(a => a.created_at >= weekStart).length;
  const totalPrev7Days = apps.filter(a => a.created_at >= prevWeekStart && a.created_at < weekStart).length;

  // Calculate Deltas
  const deltaToday = newToday - newYesterday;
  const deltaWeekly = totalLast7Days - totalPrev7Days;
  const deltaWeeklyPercent = totalPrev7Days === 0 ? 100 : Math.round(((totalLast7Days - totalPrev7Days) / totalPrev7Days) * 100);

  // Total New (All time) requires a separate count query
  const { count: totalNew } = await supabase
    .from('ambassador_applications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');

  return {
      newToday,
      newYesterday,
      totalLast7Days,
      deltaToday,
      deltaWeekly,
      deltaWeeklyPercent,
      totalNew: totalNew || 0
  };
};

// --- Clients ---

export const getClients = async () => {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) return [];
  return data as Client[];
};

export const getClientsByAmbassador = async (ambassadorId: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('ambassador_id', ambassadorId);
  if (error) return [];
  return data as Client[];
};

export const getClientById = async (id: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as Client;
};

export const updateClient = async (id: string, data: Partial<Client>, actorId: string) => {
  const { data: updated, error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) return null;
  await logAuditSupabase(actorId, 'UPDATE', 'client', id, null, updated);
  return updated as Client;
};

export const deleteClient = async (id: string, actorId: string) => {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) return null;
  await logAuditSupabase(actorId, 'DELETE', 'client', id, null, null);
  return true;
};

export const getClientByUserId = async (userId: string) => {
  const { data: relation } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', userId)
    .single();
    
  if (!relation) return null;
  return getClientById(relation.client_id);
};

export const createClient = async (
    data: Omit<Client, 'id' | 'created_at' | 'last_activity_at'> & { 
        login_email?: string, 
        login_password?: string 
    }, 
    actorId: string
) => {
  
  // 1. If login credentials provided, create User first
  let newUserId = null;
  if (data.login_email && data.login_password) {
      const emailNorm = data.login_email.trim().toLowerCase();
      const existing = await getUserByEmail(emailNorm);
      if (existing) {
          throw new Error('Client Login Email already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(data.login_password, salt);
      
      const userId = uuidv4();
      await supabase.from('users').insert({
          id: userId,
          email: emailNorm,
          password_hash: hash,
          role: 'client_user'
      });
      newUserId = userId;
  }

  // 2. Create Client
  const { login_email, login_password, ...clientData } = data;
  const clientId = uuidv4();
  
  const { data: newClient, error } = await supabase.from('clients').insert({
    id: clientId,
    ...clientData,
    created_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString()
  }).select().single();

  if (error) throw new Error(error.message);

  // 3. Link User to Client
  if (newUserId) {
      await supabase.from('client_users').insert({
          id: uuidv4(),
          user_id: newUserId,
          client_id: clientId
      });
  }

  await logAuditSupabase(actorId, 'CREATE', 'client', clientId, null, newClient);
  return newClient as Client;
};

export const assignClientToAmbassador = async (clientId: string, ambassadorId: string | null, actorId: string) => {
  if (ambassadorId) {
      const amb = await getAmbassadorById(ambassadorId);
      if (!amb) throw new Error('Ambassador not found');
      if (amb.status !== 'active') throw new Error('Ambassador is not active');
  }

  const { data: updated, error } = await supabase
    .from('clients')
    .update({ 
        ambassador_id: ambassadorId,
        updated_at: new Date().toISOString()
    })
    .eq('id', clientId)
    .select()
    .single();

  if (error) return null;
  
  const action = ambassadorId ? 'ASSIGN_AMBASSADOR' : 'UNASSIGN_AMBASSADOR';
  await logAuditSupabase(actorId, action, 'client', clientId, null, updated);
  
  return updated as Client;
};

// --- Dashboard Projects ---

export const getDashboardProject = async (clientId: string) => {
  const { data } = await supabase.from('dashboard_projects').select('*').eq('client_id', clientId).single();
  return data as DashboardProject | null;
};

export const upsertDashboardProject = async (
  clientId: string, 
  data: Partial<Omit<DashboardProject, 'id' | 'client_id' | 'created_at' | 'updated_at'>>, 
  actorId: string
) => {
  const existing = await getDashboardProject(clientId);
  
  if (existing) {
    const { data: updated } = await supabase
      .from('dashboard_projects')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    await logAuditSupabase(actorId, 'UPDATE', 'dashboard_project', existing.id, existing, updated);
    return updated as DashboardProject;
  } else {
    const newId = uuidv4();
    const { data: created } = await supabase
      .from('dashboard_projects')
      .insert({
        id: newId,
        client_id: clientId,
        template_key: 'default',
        ...data
      })
      .select()
      .single();
    await logAuditSupabase(actorId, 'CREATE', 'dashboard_project', newId, null, created);
    return created as DashboardProject;
  }
};

// --- Commissions ---

export const getCommissions = async () => {
  const { data } = await supabase.from('commissions').select('*');
  return (data || []) as Commission[];
};

export const createCommission = async (data: Omit<Commission, 'id' | 'created_at'>, actorId: string) => {
  const { data: created, error } = await supabase
    .from('commissions')
    .insert({ id: uuidv4(), ...data })
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  await logAuditSupabase(actorId, 'CREATE', 'commission', created.id, null, created);
  return created as Commission;
};

export const updateCommission = async (id: string, data: Partial<Commission>, actorId: string) => {
  const { data: updated, error } = await supabase
    .from('commissions')
    .update(data)
    .eq('id', id)
    .select()
    .single();
    
  if (error) return null;
  await logAuditSupabase(actorId, 'UPDATE', 'commission', id, null, updated);
  return updated as Commission;
};

export const deleteCommission = async (id: string, actorId: string) => {
  await supabase.from('commissions').delete().eq('id', id);
  await logAuditSupabase(actorId, 'DELETE', 'commission', id, null, null);
  return true;
};

// --- Appointments ---

export const getAppointments = async (ambassadorId: string, startDate?: string, endDate?: string) => {
  let query = supabase.from('appointments').select('*').eq('ambassador_id', ambassadorId);
  
  if (startDate) query = query.gte('start_at', startDate);
  if (endDate) query = query.lte('start_at', endDate);
  
  const { data } = await query;
  return (data || []) as Appointment[];
};

export const getAppointmentById = async (id: string) => {
  const { data } = await supabase.from('appointments').select('*').eq('id', id).single();
  return data as Appointment | null;
};

export const createAppointment = async (
    ambassadorId: string, 
    data: Omit<Appointment, 'id' | 'ambassador_id'>, 
    actorId?: string // Optional, defaults to ambassadorId if not provided
) => {
  const { data: created } = await supabase
    .from('appointments')
    .insert({
      id: uuidv4(),
      ambassador_id: ambassadorId,
      ...data
    })
    .select()
    .single();
    
  await logAuditSupabase(actorId || ambassadorId, 'CREATE', 'appointment', created.id, null, created);
  return created as Appointment;
};

export const updateAppointment = async (id: string, data: Partial<Appointment>, actorId: string) => {
  const { data: updated } = await supabase
    .from('appointments')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  await logAuditSupabase(actorId, 'UPDATE', 'appointment', id, null, updated);
  return updated as Appointment;
};

export const deleteAppointment = async (id: string, actorId: string) => {
  await supabase.from('appointments').delete().eq('id', id);
  await logAuditSupabase(actorId, 'DELETE', 'appointment', id, null, null);
  return true;
};

// --- Audit ---

export const getAuditLogs = async () => {
  const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
  return (data || []) as AuditLog[];
};

async function logAuditSupabase(actorId: string, action: string, entityType: string, entityId: string, before: any, after: any) {
  try {
    await supabase.from('audit_logs').insert({
      id: uuidv4(),
      actor_user_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      before_json: before ? JSON.stringify(before) : null,
      after_json: after ? JSON.stringify(after) : null
    });
  } catch (e) {
    console.error('Audit Log Failed:', e);
  }
}

// --- Seeding ---

export const seedData = async () => {
  // Only seed if Users empty to avoid duplicates
  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
  if (count && count > 0) return false;

  const demoSalt = await bcrypt.genSalt(10);
  const demoHash = await bcrypt.hash('123456', demoSalt);

  // 1. Create Users
  await supabase.from('users').insert([
      { id: 'user_admin', email: 'system@klaroops.com', password_hash: demoHash, role: 'admin' },
      { id: 'user_amb_1', email: 'carlos@demo.com', password_hash: demoHash, role: 'ambassador' },
      { id: 'user_amb_2', email: 'maria@demo.com', password_hash: demoHash, role: 'ambassador' }
  ]);

  // 2. Create Ambassadors
  await supabase.from('ambassadors').insert([
    { id: 'amb_1', user_id: 'user_amb_1', name: 'Carlos Rodriguez', status: 'active', commission_rule_json: '{"rate": 0.10}' },
    { id: 'amb_2', user_id: 'user_amb_2', name: 'Maria Garcia', status: 'active', commission_rule_json: '{"rate": 0.15}' },
  ]);

  // 3. Create Clients
  await supabase.from('clients').insert([
      { id: 'cli_1', name: 'Fabrica Textil Apex', status: 'active', ambassador_id: 'amb_1' },
      { id: 'cli_2', name: 'Manufacturas del Norte', status: 'paused', ambassador_id: 'amb_1' },
      { id: 'cli_3', name: 'Plásticos Industriales', status: 'active', ambassador_id: 'amb_2' },
      { id: 'cli_4', name: 'Cliente Nuevo Sin Asignar', status: 'active', ambassador_id: null },
  ]);

  return true;
};

// --- Stats ---

export const getAdminStats = async () => {
  const { count: totalAmbassadors } = await supabase.from('ambassadors').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { count: totalClients } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active');
  
  // For sums we'd need a different query or rpc, simplistic approach for now:
  const { data: comms } = await supabase.from('commissions').select('amount_cents, status');
  const pending = comms?.filter((c: any) => c.status === 'pending').reduce((s: any, c: any) => s + (c.amount_cents / 100), 0) || 0;
  const paid = comms?.filter((c: any) => c.status === 'paid').reduce((s: any, c: any) => s + (c.amount_cents / 100), 0) || 0;

  return {
    totalAmbassadors: totalAmbassadors || 0,
    totalClients: totalClients || 0,
    leadsThisMonth: 0,
    pendingCommissions: pending,
    paidCommissions: paid,
  };
};

export const getSystemConfig = async () => {
  const { data } = await supabase.from('system_config').select('*').single();
  return data as import('@/types/admin').SystemConfig | null;
};

export const updateSystemConfig = async (data: Partial<import('@/types/admin').SystemConfig>) => {
  const existing = await getSystemConfig();
  
  if (existing) {
     const { data: updated } = await supabase.from('system_config').update({
         ...data,
         updated_at: new Date().toISOString()
     }).eq('id', existing.id || 'google_auth').select().single();
     return updated;
  } else {
     const { data: created } = await supabase.from('system_config').insert({
         id: 'google_auth',
         ...data
     }).select().single();
     return created;
  }
};

// --- AI Chat ---

export const getAIThreads = async (clientId: string) => {
  const { data, error } = await supabase
    .from('ai_threads')
    .select('*')
    .eq('client_id', clientId)
    .order('updated_at', { ascending: false });
    
  if (error) return [];
  return data as AIThread[];
};

export const createAIThread = async (clientId: string, title: string, actorId: string) => {
  const { data, error } = await supabase
    .from('ai_threads')
    .insert({
      client_id: clientId,
      title: title
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as AIThread;
};

export const getAIMessages = async (threadId: string) => {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
    
  if (error) return [];
  return data as AIMessage[];
};

export const addAIMessage = async (threadId: string, role: 'user' | 'assistant' | 'system', content: string) => {
  const { data, error } = await supabase
    .from('ai_messages')
    .insert({
      thread_id: threadId,
      role,
      content
    })
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  // Update thread timestamp
  await supabase.from('ai_threads').update({ updated_at: new Date().toISOString() }).eq('id', threadId);
  
  return data as AIMessage;
};

export const getClientContextForAI = async (clientId: string) => {
  // 1. Basic Client Info
  const client = await getClientById(clientId);
  if (!client) return null;

  // 2. Dashboard Data (if any)
  const dashboard = await getDashboardProject(clientId);

  // 3. Commissions (Recent)
  const { data: commissions } = await supabase
    .from('commissions')
    .select('*')
    .eq('client_id', clientId)
    .limit(10);

  return {
    client_name: client.name,
    industry: client.industry,
    contract_value: client.contract_value_cents,
    status: client.status,
    dashboard_kpis: dashboard?.kpi_rules_json || '{}',
    recent_commissions: commissions || []
  };
};
