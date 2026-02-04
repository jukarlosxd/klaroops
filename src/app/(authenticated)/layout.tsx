import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Calendar, LogOut, Shield, Users, Briefcase, Settings, Inbox } from "lucide-react";
import { authOptions } from '@/lib/auth';
import { getAmbassadorApplications } from '@/lib/admin-db'; // For Badge

import SignOutButton from "@/components/SignOutButton";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  // Force admin role check based on email if role is missing (failsafe)
  const isAdmin = session.user?.email === process.env.ADMIN_EMAIL || (session.user as any)?.role === 'admin';
  const role = (session.user as any)?.role || (isAdmin ? 'admin' : 'ambassador');
  const isClient = role === 'client_user';

  // Badge Logic (Admin Only)
  let newAppsCount = 0;
  if (isAdmin) {
      const apps = await getAmbassadorApplications();
      // Safe check to prevent layout crash
      if (Array.isArray(apps)) {
          newAppsCount = apps.filter(a => a.status === 'new').length;
      }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block fixed h-full z-10">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">KlaroOps</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">
            {isAdmin ? 'Admin Panel' : (isClient ? 'Client Portal' : 'Ambassador Panel')}
          </p>
        </div>
        
        <nav className="p-4 space-y-1">
          {isAdmin ? (
            // Admin Navigation
            <>
              <Link href="/admin/dashboard" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <LayoutDashboard size={20} className="text-blue-600" />
                Home Admin
              </Link>
              
              <Link href="/admin/applications" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <div className="flex items-center gap-3">
                    <Inbox size={20} className="text-purple-600" />
                    Applications
                </div>
                {newAppsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {newAppsCount}
                    </span>
                )}
              </Link>

              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase">Management</div>
              <Link href="/admin/ambassadors" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <Users size={20} />
                Ambassadors
              </Link>
              <Link href="/admin/clients" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <Briefcase size={20} />
                Clients
              </Link>
              <Link href="/admin/audit" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <Shield size={20} />
                Audit Log
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <Settings size={20} />
                Settings
              </Link>
            </>
          ) : isClient ? (
             // Client User Navigation
             <Link href="/app" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <LayoutDashboard size={20} className="text-blue-600" />
                My Dashboard
             </Link>
          ) : (
            // Ambassador Navigation
            <>
              <Link href="/dashboard" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <LayoutDashboard size={20} className="text-blue-600" />
                Home
              </Link>
              <Link href="/dashboard/view" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <Briefcase size={20} />
                Client Dashboards
              </Link>
              <Link href="/clients" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <Users size={20} />
                My Clients
              </Link>
              <Link href="/appointments" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <Calendar size={20} />
                Appointments
              </Link>
            </>
          )}
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="flex items-center gap-3 p-2 text-gray-600 text-sm">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white ${isAdmin ? 'bg-blue-900' : 'bg-blue-600'}`}>
              {session.user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium truncate text-gray-900">{session.user?.name}</p>
              <p className="text-xs truncate text-gray-500">{session.user?.email}</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
