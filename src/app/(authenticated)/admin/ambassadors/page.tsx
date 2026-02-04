import React from 'react';
import { getAmbassadors, getClients, getCommissions } from '@/lib/admin-db';
import AmbassadorsClient from './client';

export const dynamic = 'force-dynamic';

export default async function AmbassadorsPage(props: { searchParams: Promise<any> }) {
  await props.searchParams;
  
  try {
    const ambassadors = await getAmbassadors();
    const allClients = await getClients();
    const allCommissions = await getCommissions();

    const safeAmbassadors = Array.isArray(ambassadors) ? ambassadors : [];
    const safeClients = Array.isArray(allClients) ? allClients : [];
    const safeCommissions = Array.isArray(allCommissions) ? allCommissions : [];

    // Calculate KPIs per ambassador
    const enrichedAmbassadors = safeAmbassadors.map(amb => {
      const clients = safeClients.filter(c => c.ambassador_id === amb.id);
      const activeClients = clients.filter(c => c.status === 'active').length;
      
      const commissions = safeCommissions.filter(c => c.ambassador_id === amb.id);
      const pendingCommissionCents = commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.amount_cents, 0);

      return {
        ...amb,
        activeClients,
        totalClients: clients.length,
        pendingCommission: pendingCommissionCents / 100 // Convert to dollars/units
      };
    });

    return <AmbassadorsClient ambassadors={enrichedAmbassadors} />;
  } catch (error) {
    console.error("Error loading ambassadors:", error);
    return (
      <div className="p-8 text-center text-red-600">
        Error loading ambassadors data.
      </div>
    );
  }
}