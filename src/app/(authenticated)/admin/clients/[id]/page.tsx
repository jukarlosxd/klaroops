import { 
  getClientById, 
  getAmbassadors, 
  getDashboardProject, 
  getAIThreads, 
  getAuditLogs,
  getClientAIProfile
} from '@/lib/admin-db';
import { getGoogleIntegrationStatus } from '@/lib/google-auth';
import ClientDetailClient from './client';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ClientDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const client = await getClientById(params.id);
    
    if (!client) {
      notFound();
    }

    const ambassadors = (await getAmbassadors()) || [];
    const dashboardProject = await getDashboardProject(client.id);
    const aiThreads = (await getAIThreads(client.id)) || [];
    const aiProfile = await getClientAIProfile(client.id);
    const googleStatus = await getGoogleIntegrationStatus();
    
    // Filter logs for this client
    const allLogs = (await getAuditLogs()) || [];
    const relevantLogs = Array.isArray(allLogs) ? allLogs.filter(l => 
      (l.entity_type === 'client' && l.entity_id === client.id) ||
      (l.entity_type === 'dashboard_project' && dashboardProject && l.entity_id === dashboardProject.id)
    ) : [];

    return (
      <ClientDetailClient 
        client={client}
        ambassadors={ambassadors}
        initialDashboardProject={dashboardProject}
        initialAIThreads={aiThreads}
        initialAIProfile={aiProfile}
        auditLogs={relevantLogs}
        serviceAccountEmail={googleStatus?.email}
      />
    );
  } catch (error) {
    console.error("Error loading client details:", error);
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold mb-2">Error Loading Client</h2>
        <p>Could not load client details. Please try again later.</p>
        <pre className="mt-4 text-xs bg-gray-100 p-2 rounded text-left overflow-auto max-w-md mx-auto">
          {String(error)}
        </pre>
      </div>
    );
  }
}
