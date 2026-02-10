import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientByUserId, getDashboardProject } from "@/lib/admin-db";
import { isTrialActive } from "@/lib/entitlements";
import DashboardWizard from "@/components/DashboardWizard/Wizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) redirect("/?view=login");

  const client = await getClientByUserId(session.user.id);
  if (!client) redirect("/dashboard");

  // Check Trial Limits
  // We assume 1 project limit for trial for now. 
  // In a real app, we'd query all projects, but getDashboardProject returns a single one per client currently.
  // If we want multiple, we'd need getDashboardProjects(clientId). 
  // For now, let's assume if one exists, they hit the limit if on trial.
  
  const existingProject = await getDashboardProject(client.id);
  const isTrial = client.plan === 'trial';

  // If trial and project exists, block (unless we want to allow editing/overwriting? 
  // The requirement says "Only allow one dataset". So if one exists, maybe we redirect or show error.
  // But maybe the user wants to DELETE the old one and start fresh.
  // For this Wizard, we'll pass the count and let the Wizard handle the UI/blocking or warning.
  
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium mb-4">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
      
      <DashboardWizard 
        clientId={client.id} 
        isTrial={isTrial} 
        existingProjectsCount={existingProject ? 1 : 0} 
      />
    </div>
  );
}
