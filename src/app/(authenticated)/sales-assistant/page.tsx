import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAmbassadorByUserId } from '@/lib/admin-db';
import { redirect } from 'next/navigation';
import SalesAssistantClient from '@/components/ambassador/SalesAssistantClient';

export const dynamic = 'force-dynamic';

export default async function SalesAssistantPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return redirect('/login');
  }

  // If admin, maybe redirect? Or allow admin to see a demo version?
  // For now, only ambassadors.
  const ambassador = await getAmbassadorByUserId(session.user.id);
  
  if (!ambassador && session.user.role !== 'admin') {
      return <div className="p-8">Access Denied. Ambassador profile required.</div>;
  }

  return <SalesAssistantClient />;
}
