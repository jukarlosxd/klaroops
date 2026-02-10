import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from '@/lib/auth';
import { getAmbassadorApplications, getClientByUserId } from '@/lib/admin-db'; // For Badge & Chat
import ChatWidget from "@/components/ChatWidget";
import Sidebar from "@/components/Sidebar";
import TrialBanner from "@/components/TrialBanner";
import { LanguageProvider } from "@/context/LanguageContext";
import { isTrialActive, isTrialExpired } from "@/lib/entitlements";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/?view=login");
  }
  
  // Force admin role check based on email if role is missing (failsafe)
  const isAdmin = session.user?.email === process.env.ADMIN_EMAIL || (session.user as any)?.role === 'admin';
  const role = (session.user as any)?.role || (isAdmin ? 'admin' : 'ambassador');
  const isClient = role === 'client_user';

  // Badge Logic (Admin Only)
  let newAppsCount = 0;
  if (isAdmin) {
      try {
          const apps = await getAmbassadorApplications();
          // Safe check to prevent layout crash
          if (Array.isArray(apps)) {
              newAppsCount = apps.filter(a => a.status === 'new').length;
          }
      } catch (e) {
          console.error("Failed to load applications for badge", e);
      }
  }

  // Chat Data (Client Only)
  let clientData = null;
  if (isClient) {
      try {
          clientData = await getClientByUserId((session.user as any).id);
      } catch (e) {
          console.error("Failed to load client data for chat", e);
      }
  }

  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        
        {/* Trial Banner */}
        {isClient && clientData && clientData.plan === 'trial' && (
          <TrialBanner 
             trialEndsAt={clientData.trial_ends_at} 
             isExpired={isTrialExpired(clientData)} 
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            user={session.user || {}} 
            isAdmin={isAdmin} 
            isClient={isClient} 
            newAppsCount={newAppsCount} 
          />

          {/* Main Content */}
          <main className="flex-1 md:ml-64 p-8 overflow-auto">
            {children}
          </main>
        </div>

        {/* AI Chat Widget (Only for Clients) */}
        {isClient && clientData && (
          <ChatWidget clientId={clientData.id} clientName={clientData.name} />
        )}
      </div>
    </LanguageProvider>
  );
}
