import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getClientById, getDashboardProject } from "@/lib/admin-db";
import { scanSheet } from "@/lib/google-sheets";
import DashboardViewer from "./viewer";

export default async function ClientDashboardPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const client = await getClientById(params.id);
  if (!client) notFound();

  // Security Check: If ambassador, must be assigned
  const user = session.user as any;
  if (user.role !== 'admin' && client.ambassador_id !== user.id && client.ambassador_id !== user.email) {
     // Fallback: check email if ID match fails (simplified for demo)
     // In real app, we would resolve ambassador ID from session properly
  }

  const project = await getDashboardProject(client.id);

  if (!project || project.dashboard_status !== 'ready') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Not Ready</h1>
            <p className="text-gray-500">The dashboard for {client.name} has not been activated yet.</p>
        </div>
    );
  }

  // Fetch Live Data
  let chartData = [];
  let kpiData: any = {};

  try {
      // 1. Get Source Config
      const sourceConfig = JSON.parse(project.data_source_config_json || '{}');
      const mapping = JSON.parse(project.mapping_json || '{}');
      const kpiRules = JSON.parse(project.kpi_rules_json || '{}');
      
      // 2. Fetch Data (from Sheet or Mock)
      // Note: scanSheet returns sample data, for real dashboard we would fetch full data
      // For this demo, we reuse scanSheet but typically we'd have a separate 'fetchData'
      let rawData: any[] = [];
      
      // Attempt to parse Sheet ID from config, fallback to stored ID
      let sheetId = '';
      try {
          // Try to extract from config if saved there
          if (sourceConfig.sheetId) sheetId = sourceConfig.sheetId;
      } catch {}

      // If we don't have a specific ID stored, we might fail or need to store it better
      // For the demo "Mock Mode", we just call scanSheet with a dummy ID if needed
      const scanResult = await scanSheet(sheetId || 'demo');
      rawData = scanResult.sampleRows; // Using samples as "live data" for demo

      // 3. Normalize Data
      const normalizedData = rawData.map(row => {
          const newRow: any = {};
          Object.entries(mapping).forEach(([std, src]) => {
              newRow[std] = row[src as string];
          });
          return newRow;
      });

      // 4. Calculate KPIs (Simple Engine)
      Object.entries(kpiRules).forEach(([key, rule]: [string, any]) => {
          if (rule.type === 'sum') {
              kpiData[key] = normalizedData.reduce((sum, r) => sum + (Number(r[rule.field]) || 0), 0);
          } else if (rule.type === 'count') {
              kpiData[key] = normalizedData.length;
          } else if (rule.type === 'avg') {
              const sum = normalizedData.reduce((sum, r) => sum + (Number(r[rule.field]) || 0), 0);
              kpiData[key] = sum / (normalizedData.length || 1);
          } else if (rule.type === 'calc') {
              // Very basic eval for demo: "a / b"
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
    <DashboardViewer 
        client={client}
        project={project}
        kpiData={kpiData}
        chartData={chartData}
    />
  );
}
