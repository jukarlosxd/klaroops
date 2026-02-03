import { getAppointments, getClientsByAmbassador } from '@/lib/admin-db';
import { getAmbassadorByUserId } from '@/lib/admin-db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppointmentsBoard from '@/components/AppointmentsBoard';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // If admin, redirect to admin dashboard as this page is for ambassadors
  if (session.user.role === 'admin') {
     return redirect('/admin/dashboard');
  }

  const ambassador = await getAmbassadorByUserId(session.user.id);
  
  if (!ambassador) {
    return <div className="p-8 text-center">Ambassador profile not found.</div>;
  }

  const appointments = await getAppointments(ambassador.id) || [];
  const clients = await getClientsByAmbassador(ambassador.id) || [];
  
  return (
    <div className="h-[calc(100vh-100px)] p-6">
      <AppointmentsBoard 
        mode="portal" 
        ambassadorId={ambassador.id} 
        initialAppointments={appointments}
        clients={clients} 
      />
    </div>
  );
}
