import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getClientByUserId, getDashboardProject } from '@/lib/admin-db';
import { redirect } from 'next/navigation';
import DashboardClient from './client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return redirect('/?view=login');
  }

  // 1. Get Client Context
  const client = await getClientByUserId(session.user.id);
  
  // If no client profile found (shouldn't happen for valid users), redirect or error
  if (!client) {
      if (session.user.role === 'admin') return redirect('/admin/dashboard');
      return <div className="p-8">Error: Client profile not found.</div>;
  }

  // 2. Get Dashboard Project
  const project = await getDashboardProject(client.id);

  // 3. Render Client Component
  return <DashboardClient project={project} client={client} />;
}
