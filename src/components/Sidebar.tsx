'use client';

import Link from "next/link";
import { LayoutDashboard, Calendar, LogOut, Shield, Users, Briefcase, Settings, Inbox } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user: { name?: string | null, email?: string | null };
  isAdmin: boolean;
  isClient: boolean;
  newAppsCount: number;
}

export default function Sidebar({ user, isAdmin, isClient, newAppsCount }: SidebarProps) {
  const { lang, setLang, t } = useLanguage();

  return (
    <aside className="w-64 bg-white border-r hidden md:flex flex-col fixed h-full z-10">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">{t.sidebar.brand}</h1>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">
          {isAdmin ? t.sidebar.adminPanel : (isClient ? t.sidebar.clientPortal : t.sidebar.ambassadorPanel)}
        </p>
      </div>

      {/* Language Toggle */}
      <div className="px-4 mt-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setLang('en')}
            className={`flex-1 py-1 text-xs font-bold rounded transition-all ${lang === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('es')}
            className={`flex-1 py-1 text-xs font-bold rounded transition-all ${lang === 'es' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ES
          </button>
        </div>
      </div>
      
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {isAdmin ? (
          // Admin Navigation
          <>
            <Link href="/admin/dashboard" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <LayoutDashboard size={20} className="text-blue-600" />
              {t.sidebar.homeAdmin}
            </Link>
            
            <Link href="/admin/applications" className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <div className="flex items-center gap-3">
                  <Inbox size={20} className="text-purple-600" />
                  {t.sidebar.applications}
              </div>
              {newAppsCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {newAppsCount}
                  </span>
              )}
            </Link>

            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase">{t.sidebar.management}</div>
            <Link href="/admin/ambassadors" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <Users size={20} />
              {t.sidebar.ambassadors}
            </Link>
            <Link href="/admin/clients" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <Briefcase size={20} />
              {t.sidebar.clients}
            </Link>
            <Link href="/admin/audit" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <Shield size={20} />
              {t.sidebar.auditLog}
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <Settings size={20} />
              {t.sidebar.settings}
            </Link>
          </>
        ) : isClient ? (
           // Client User Navigation
           <Link href="/app" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <LayoutDashboard size={20} className="text-blue-600" />
              {t.sidebar.myDashboard}
           </Link>
        ) : (
          // Ambassador Navigation
          <>
            <Link href="/dashboard" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <LayoutDashboard size={20} className="text-blue-600" />
              {t.sidebar.home}
            </Link>

            {/* Sales Block */}
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase">Sales</div>
            
            <Link href="/sales-assistant" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                <Briefcase size={20} className="text-purple-600" />
                {t.sidebar.salesAssistantMenu}
            </Link>

            <Link href="/clients" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <Users size={20} />
              {t.sidebar.mySales}
            </Link>

            {/* Operation Block */}
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase">Operation</div>

            <Link href="/dashboard/view" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <Settings size={20} />
              {t.sidebar.dashboards}
            </Link>

            <Link href="/appointments" className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
              <Calendar size={20} />
              {t.sidebar.appointments}
            </Link>
          </>
        )}
      </nav>
      
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-3 p-2 text-gray-600 text-sm">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white ${isAdmin ? 'bg-blue-900' : 'bg-blue-600'}`}>
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-medium truncate text-gray-900">{user?.name}</p>
            <p className="text-xs truncate text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-2 mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          {t.sidebar.logout}
        </button>
      </div>
    </aside>
  );
}
