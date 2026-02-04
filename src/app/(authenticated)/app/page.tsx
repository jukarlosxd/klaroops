import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getClientByUserId, getDashboardProject } from "@/lib/admin-db";
import { scanSheet } from "@/lib/google-sheets";
import DashboardViewer from "../dashboard/view/[id]/viewer";

export default async function ClientAppPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const user = session.user as any;
  if (user.role !== 'client_user') {
      redirect("/"); // Or unauthorized page
  }

  // Get Client Linked to this User
  const client = await getClientByUserId(user.id);
  if (!client) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">No Client Linked</h1>
              <p className="text-gray-500">Your account is not linked to any client profile.</p>
          </div>
      );
  }

  const project = await getDashboardProject(client.id);

  if (!project || project.dashboard_status !== 'ready') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Not Ready</h1>
            <p className="text-gray-500">Your dashboard is currently being configured.</p>
        </div>
    );
  }

  // Fetch Live Data (Reusing logic from view/[id])
  let chartData = [];
  let kpiData: any = {};

  try {
      const sourceConfig = JSON.parse(project.data_source_config_json || '{}');
      const mapping = JSON.parse(project.mapping_json || '{}');
      const kpiRules = JSON.parse(project.kpi_rules_json || '{}');
      
      let rawData: any[] = [];
      let sheetId = '';
      try {
          if (sourceConfig.sheetId) sheetId = sourceConfig.sheetId;
      } catch {}

      const scanResult = await scanSheet(sheetId || 'demo');
      rawData = scanResult.sampleRows;

      const normalizedData = rawData.map(row => {
          const newRow: any = {};
          Object.entries(mapping).forEach(([std, src]) => {
              newRow[std] = row[src as string];
          });
          return newRow;
      });

      Object.entries(kpiRules).forEach(([key, rule]: [string, any]) => {
          if (rule.type === 'sum') {
              kpiData[key] = normalizedData.reduce((sum, r) => sum + (Number(r[rule.field]) || 0), 0);
          } else if (rule.type === 'count') {
              kpiData[key] = normalizedData.length;
          } else if (rule.type === 'avg') {
              const sum = normalizedData.reduce((sum, r) => sum + (Number(r[rule.field]) || 0), 0);
              kpiData[key] = sum / (normalizedData.length || 1);
          } else if (rule.type === 'calc') {
              const parts = rule.formula.split(' / ');
              if (parts.length === 2) {
                  const num = kpiData[parts[0]] || 0;
                  const den = kpiData[parts[1]] || 1;
                  kpiData[key] = num / den;
              }
          }
      });

      chartData = normalizedData;

  } catch (error) {
      console.error("Dashboard Render Error", error);
  }

  return (
    <div className="pt-6">
        <DashboardViewer 
            client={client}
            project={project}
            kpiData={kpiData}
            chartData={chartData}
        />
    </div>
  );
}
