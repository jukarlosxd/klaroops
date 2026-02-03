import { getAmbassadorById, getClientsByAmbassador, getCommissions, getAppointments, getAuditLogs, getClients } from '@/lib/admin-db';
import AmbassadorDetailClient from './client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AmbassadorDetailPage({ params }: { params: { id: string } }) {
  try {
    const ambassador = await getAmbassadorById(params.id);
    
    if (!ambassador) {
      notFound();
    }

    // Ensure arrays are arrays
    const clients = (await getClientsByAmbassador(ambassador.id)) || [];
    const allCommissions = (await getCommissions()) || [];
    const commissions = Array.isArray(allCommissions) ? allCommissions.filter(c => c.ambassador_id === ambassador.id) : [];
    
    const appointments = (await getAppointments(ambassador.id)) || [];
    
    // Need all clients to allow assigning unassigned ones
    const allClientsList = (await getClients()) || [];

    // Filter logs
    const allLogs = (await getAuditLogs()) || [];
    const relevantLogs = Array.isArray(allLogs) ? allLogs.filter(l => 
      (l.entity_type === 'ambassador' && l.entity_id === ambassador.id) ||
      (l.entity_type === 'client' && clients.some(c => c.id === l.entity_id)) ||
      (l.entity_type === 'commission' && commissions.some(c => c.id === l.entity_id))
    ) : [];

    return (
      <AmbassadorDetailClient 
        ambassador={ambassador}
        clients={clients}
        commissions={commissions}
        appointments={appointments}
        auditLogs={relevantLogs}
        allClients={allClientsList}
      />
    );
  } catch (error) {
    console.error("Error loading ambassador details:", error);
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
        <p>Could not load ambassador details. Please try again later.</p>
        <pre className="mt-4 text-xs bg-gray-100 p-2 rounded text-left overflow-auto max-w-md mx-auto">
          {String(error)}
        </pre>
      </div>
    );
  }
}