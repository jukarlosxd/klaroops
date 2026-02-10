import { getClientsByAmbassador } from '@/lib/admin-db';
import { getAmbassadorByUserId } from '@/lib/admin-db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClientsClient from '@/components/ambassador/ClientsClient';

export const dynamic = 'force-dynamic';

export default async function AmbassadorClientsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return redirect('/login');
  }

  // If admin, redirect to admin clients
  if (session.user.role === 'admin') {
     return redirect('/admin/clients');
  }

  const ambassador = await getAmbassadorByUserId(session.user.id);
  
  if (!ambassador) {
    return <div className="p-8 text-center">Ambassador profile not found.</div>;
  }

  const clients = await getClientsByAmbassador(ambassador.id) || [];

  return <ClientsClient clients={clients} />;
}
