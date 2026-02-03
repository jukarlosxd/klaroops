import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientsByAmbassador, getClients } from "@/lib/admin-db";
import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export default async function ClientDashboardsIndex() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const user = session.user as any;
  let clients = [];

  // Determine clients based on role
  if (user.role === 'admin') {
      clients = (await getClients()) || [];
  } else {
      clients = (await getClientsByAmbassador(user.id || user.email)) || [];
  }

  // Filter only active clients for now
  const activeClients = clients.filter(c => c.status === 'active');

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Dashboards</h1>
            <p className="text-gray-500">Select a client to view their live performance metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeClients.map(client => (
                <Link 
                    key={client.id} 
                    href={`/dashboard/view/${client.id}`}
                    className="group bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition flex flex-col justify-between h-48"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                                <LayoutDashboard size={24} />
                            </div>
                            <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">
                                {client.industry || 'Client'}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {client.notes_internal || 'View performance metrics and reports.'}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mt-4 group-hover:translate-x-1 transition-transform">
                        View Dashboard <ArrowRight size={16} />
                    </div>
                </Link>
            ))}

            {activeClients.length === 0 && (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                    <p className="text-gray-500">No active clients found with dashboards available.</p>
                </div>
            )}
        </div>
    </div>
  );
}
