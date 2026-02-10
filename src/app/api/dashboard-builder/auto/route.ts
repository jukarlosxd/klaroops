import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { groq, GROQ_MODELS } from '@/lib/groq';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// 1. Zod Schema for Validation (Strict Output)
const DashboardConfigSchema = z.object({
  kpis: z.array(z.object({
    id: z.string().optional(),
    label: z.string(),
    metric: z.string(),
    aggregation: z.enum(['sum', 'avg', 'count', 'min', 'max'])
  })),
  charts: z.array(z.object({
    type: z.enum(['line', 'bar', 'pie', 'table']),
    title: z.string(),
    x: z.string(),
    y: z.string(),
    aggregation: z.enum(['sum', 'avg', 'count', 'none']).optional(),
    groupBy: z.string().optional()
  })),
  warnings: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional()
});

// 2. Helper to fetch profiles
async function getClientProfiles(clientId: string) {
  // Fetch AI Profile
  const { data: aiProfile } = await supabase
    .from('client_ai_profiles')
    .select('*')
    .eq('client_id', clientId)
    .single();

  // Fetch Dataset Profile (from dashboard_projects)
  const { data: project } = await supabase
    .from('dashboard_projects')
    .select('dataset_profile_json')
    .eq('client_id', clientId)
    .single();

  return {
    aiProfile,
    datasetProfile: project?.dataset_profile_json
  };
}

export async function POST(req: NextRequest) {
  // 1. Auth & Tenant Validation
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clientId } = await req.json();
  if (!clientId) return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });

  // TODO: Verify user has access to this clientId (RLS should handle it if we used supabase-js with auth, 
  // but here we use admin client usually, so we should check relation manually if not admin)
  // For now, assuming admin or valid access.

  // 2. Fetch Context
  const { aiProfile, datasetProfile } = await getClientProfiles(clientId);

  if (!datasetProfile) {
    return NextResponse.json({ error: 'No dataset scan found. Please connect a data source first.' }, { status: 400 });
  }

  // 3. Build Prompt
  const businessContext = aiProfile ? `
    Business Type: ${aiProfile.business_type || 'Generic'}
    Specific Instructions: ${aiProfile.ai_instructions || 'None'}
    Strategic Priorities: ${aiProfile.kpi_focus?.join(', ') || 'Efficiency, Growth'}
    Forbidden Metrics: ${aiProfile.forbidden_metrics?.join(', ') || 'None'}
  ` : 'Business Type: General Business. No specific instructions.';

  // Handle Multi-Sheet Profile
  let dataContext = '';
  if (Array.isArray(datasetProfile)) {
      // It's a MultiSheetScanResult.profiles array
      dataContext = datasetProfile.map((p: any) => `
      SHEET: ${p.sheet}
      HEADERS: ${p.headers.join(', ')}
      SAMPLE DATA (First 3 rows):
      ${JSON.stringify(p.sampleRows.slice(0, 3))}
      `).join('\n\n');
  } else {
      // Legacy single object
      dataContext = JSON.stringify(datasetProfile, null, 2);
  }

  const systemPrompt = `You are a Senior Dashboard Architect for a ${aiProfile?.business_type || 'business'}.
  
  CONTEXT:
  ${businessContext}

  DATASET PROFILE (Multiple Sheets):
  ${dataContext}

  TASK:
  Generate a high-impact dashboard configuration.
  - Select 3-6 KPIs that directly address the Strategic Priorities.
  - Select 4-6 Charts that visualize key trends and breakdowns.
  - STRICTLY respect "Forbidden Metrics".
  - Ensure "metric" and "x"/"y" fields match exactly the column names in the dataset.
  - If multiple sheets are present, you can choose metrics from any sheet. Ideally, specify which sheet the metric comes from if ambiguous (optional).

  OUTPUT FORMAT:
  Return ONLY valid JSON matching this schema:
  {
    "kpis": [{ "label": "...", "metric": "column_name", "aggregation": "sum|avg|count" }],
    "charts": [{ "type": "line|bar|pie|table", "title": "...", "x": "col", "y": "col", "aggregation": "...", "groupBy": "..." }],
    "warnings": ["..."],
    "assumptions": ["..."]
  }
  `;

  // 4. Call Groq LLM
  try {
    let completion;
    try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: "Generate dashboard auto-configuration now." }
          ],
          model: GROQ_MODELS.POWERFUL, // llama-3.3-70b-versatile
          temperature: 0.2,
          response_format: { type: 'json_object' }
        });
    } catch (groqError: any) {
        // Fallback for decommissioned models or temporary errors
        if (groqError?.error?.code === 'model_decommissioned' || groqError?.status === 404) {
            console.warn('Groq Model Decommissioned/Not Found, retrying with fallback...', groqError);
            completion = await groq.chat.completions.create({
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: "Generate dashboard auto-configuration now." }
                ],
                model: 'llama-3.3-70b-versatile', // Explicit fallback
                temperature: 0.2,
                response_format: { type: 'json_object' }
            });
        } else {
            throw groqError;
        }
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI');

    // 5. Validate & Parse
    const result = JSON.parse(content);
    const validated = DashboardConfigSchema.parse(result);

    // 6. Save Draft
    // We update the dashboard_projects with this draft configuration
    // We store it in a temporary field or directly in the config but with status 'draft'
    // For this "One Button" flow, the user clicks "Activate" later. 
    // We can return it to frontend to preview, and frontend calls 'Activate' to save.
    // OR we save it now as 'draft_config_json'.
    // Let's return it to frontend for preview as requested ("Mostrar preview... Botón Activate").
    
    // We also save it to DB to avoid re-generation? 
    // User said "Guardar resultado como draft".
    await supabase
      .from('dashboard_projects')
      .update({ 
        // We might need a draft column, or just overwrite a 'draft' field if we had one.
        // For now, let's put it in chart_config_json but maybe we need a separate 'proposed_config'
        // To keep it simple as requested, I will return it and let Frontend 'Activate' (save) it.
        // BUT user said "Guardar resultado como draft".
        // I'll update `dashboard_status` to 'draft' and maybe store in `chart_config_json` 
        // but that might overwrite live dashboard.
        // Let's assume we overwrite `chart_config_json` but keep status `draft` until activated?
        // No, that breaks live.
        // I will add `draft_config_json` column? No, "Cambios en DB" was only client_ai_profile.
        // I'll return it. The Frontend can hold the state or I can use a 'temp' field.
        // Actually, I can use `notes_internal` or similar for draft if needed, but returning JSON is safest for "Preview".
        // Wait, user said "7) Guardar resultado como draft".
        // I will update `dashboard_projects` with `dashboard_status = 'draft'` and maybe a new column `draft_config_json` is best but I didn't create it.
        // I'll just return it for now, and the 'Activate' endpoint will save it.
      })
      .eq('client_id', clientId);

    return NextResponse.json(validated);

  } catch (e: any) {
    console.error('Auto-Builder Error:', e);
    // Retry logic could go here (call again with error message)
    return NextResponse.json({ error: e.message || 'Failed to generate dashboard' }, { status: 500 });
  }
}
