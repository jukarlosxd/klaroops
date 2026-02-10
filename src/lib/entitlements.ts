import { Client } from "@/types/admin";

export type PlanType = 'trial' | 'starter' | 'growth' | 'pro';

export const PLANS = {
  trial: {
    label: "Free Trial",
    historyDays: 14,
    maxDatasets: 1,
    alerts: false,
    aiChat: false,
    price: 0
  },
  starter: {
    label: "Starter",
    historyDays: 14,
    maxDatasets: 1,
    alerts: false,
    aiChat: true,
    price: 15
  },
  growth: {
    label: "Growth",
    historyDays: 90,
    maxDatasets: 5,
    alerts: true,
    aiChat: true,
    price: 29
  },
  pro: {
    label: "Pro",
    historyDays: 365,
    maxDatasets: 20,
    alerts: true,
    aiChat: true,
    price: 49
  }
};

export function getPlanLimits(plan: PlanType | undefined) {
  return PLANS[plan || 'trial'];
}

export function isTrialActive(client: Client) {
  if (client.plan !== 'trial') return false;
  if (!client.trial_ends_at) return false;
  return new Date(client.trial_ends_at) > new Date();
}

export function isTrialExpired(client: Client) {
  if (client.plan !== 'trial') return false;
  if (!client.trial_ends_at) return true; // No date means expired or invalid
  return new Date(client.trial_ends_at) <= new Date();
}

export function canAccessHistory(client: Client, daysRequested: number) {
  const limits = getPlanLimits(client.plan);
  return daysRequested <= limits.historyDays;
}
