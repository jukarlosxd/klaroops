import bcrypt from 'bcryptjs';

export type Role = 'admin' | 'ambassador' | 'client_user';
export type AmbassadorStatus = 'active' | 'inactive';
export type ClientStatus = 'active' | 'paused' | 'cancelled';
export type CommissionStatus = 'pending' | 'paid' | 'reversed';
export type AppointmentStatus = 'scheduled' | 'done' | 'cancelled';
export type LeadStatus = 'new' | 'contacted' | 'booked' | 'won' | 'lost';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: string;
}

export interface Ambassador {
  id: string;
  user_id: string; // Link to User table
  name: string;
  status: AmbassadorStatus;
  commission_rule_json: string;
  created_at: string;
  last_login_at?: string;
  email?: string; // Hydrated from User
}

export interface Client {
  id: string;
  name: string;
  legal_name?: string;
  industry?: string;
  status: ClientStatus;
  ambassador_id: string | null;
  
  // Contract
  contract_value_cents?: number;
  contract_currency?: string; // 'USD'
  contract_type?: 'monthly' | 'one-time';
  contract_start?: string;
  contract_end?: string;
  billing_cycle?: 'monthly' | 'weekly' | 'custom';
  onboarding_status?: 'new' | 'onboarding' | 'live' | 'paused';
  
  notes_internal?: string;
  created_at: string;
  updated_at?: string;
  last_activity_at: string;
}

export interface DashboardProject {
  id: string;
  client_id: string;
  template_key: string; // 'manufacturing', 'sales', etc
  data_source_type: 'google_sheets' | 'csv' | 'api' | 'manual';
  data_source_config_json: string;
  mapping_json: string;
  kpi_rules_json: string;
  chart_config_json?: string;
  dashboard_status: 'not_started' | 'configuring' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
}

export interface AIThread {
  id: string;
  client_id: string;
  project_id?: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  thread_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_json: string | null;
  after_json: string | null;
  created_at: string;
}

export interface Commission {
  id: string;
  ambassador_id: string;
  client_id: string;
  amount_cents: number;
  status: CommissionStatus;
  period_start: string;
  period_end: string;
  created_at: string;
  note?: string;
}

export interface Appointment {
  id: string;
  ambassador_id: string;
  client_id?: string;
  client_name?: string;
  title: string;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface ClientUser {
  id: string;
  user_id: string; // Link to User
  client_id: string; // Link to Client
  created_at: string;
}

export interface AmbassadorApplication {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  city_state?: string;
  message: string;
  status: 'new' | 'contacted' | 'approved' | 'rejected' | 'email_failed';
  ip_address?: string;
  user_agent?: string;
  notes_internal?: string;
  updated_at?: string;
  created_at: string;
}

export interface SystemConfig {
  id: string; // 'google_auth'
  access_token: string | null;
  refresh_token: string | null;
  token_expiry: number | null; // Timestamp
  updated_at: string;
}

export interface AdminDB {
  users: User[];
  ambassadors: Ambassador[];
  ambassador_applications: AmbassadorApplication[];
  clients: Client[];
  client_users: ClientUser[];
  commissions: Commission[];
  appointments: Appointment[];
  audit_logs: AuditLog[];
  dashboard_projects: DashboardProject[];
  ai_threads: AIThread[];
  ai_messages: AIMessage[];
  system_config?: SystemConfig; // Optional for backward compatibility
}