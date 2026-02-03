import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// We assume GOOGLE_API_KEY is present
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export interface GeneratedConfig {
  source_config: any;
  column_mapping: any;
  kpi_rules: any;
  chart_config: any;
  warnings: string[];
}

export const generateDashboardConfig = async (
  templateKey: string,
  headers: string[],
  sampleRows: any[],
  inferredTypes: any
): Promise<GeneratedConfig> => {
  
  const prompt = `
    You are a Data Engineer configuring a dashboard.
    
    TEMPLATE: "${templateKey}"
    The template expects specific data points. 
    - If 'sales_overview', look for: Date, Revenue/Amount, Product, Customer, Stage.
    - If 'manufacturing', look for: Date, Units Produced, Scrap/Defects, Downtime, Machine ID.
    
    SOURCE DATA:
    Headers: ${JSON.stringify(headers)}
    Inferred Types: ${JSON.stringify(inferredTypes)}
    Sample Data (first 3 rows): ${JSON.stringify(sampleRows.slice(0, 3))}
    
    TASK:
    Generate a JSON configuration to map this source data to the template.
    
    OUTPUT SCHEMA (Strict JSON):
    {
      "source_config": { "primary_date_column": "Name of date column" },
      "column_mapping": { 
         "standard_field_name": "source_header_name" 
      },
      "kpi_rules": {
         "kpi_key": { "type": "sum/avg/count", "field": "standard_field_name", "filter": "optional sql-like filter" }
      },
      "chart_config": {
         "chart_key": { "type": "line/bar", "metric": "kpi_key", "dimension": "standard_field_name" }
      },
      "warnings": ["List any missing required fields or low confidence mappings"]
    }
    
    RULES:
    1. Only map columns that actually exist in Headers.
    2. Normalize field names in column_mapping (e.g. "production_date" -> "Date").
    3. If a required field for the template is missing, add a warning.
    4. Create at least 3 relevant KPIs based on the data.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    const content = result.response.text();
    
    if (!content) throw new Error("No content from LLM");

    return JSON.parse(content) as GeneratedConfig;
  } catch (error: any) {
    console.error("LLM Generation Error:", error);
    
    // Mock Fallback if API Key missing or fails
    if (error.message?.includes('API key') || !process.env.GOOGLE_API_KEY) {
        console.warn('Returning MOCK CONFIG due to missing LLM credentials');
        return {
            source_config: { primary_date_column: "Date" },
            column_mapping: {
                "production_date": "Date",
                "product_sku": "Product_ID",
                "units_produced": "Units_Produced",
                "scrap_count": "Scrap_Count",
                "operator": "Operator_Name"
            },
            kpi_rules: {
                "total_production": { "type": "sum", "field": "units_produced" },
                "total_scrap": { "type": "sum", "field": "scrap_count" },
                "scrap_rate": { "type": "calc", "formula": "total_scrap / total_production" }
            },
            chart_config: {
                "production_trend": { "type": "line", "metric": "total_production", "dimension": "production_date" }
            },
            warnings: ["Running in DEMO MODE (Mock AI Response)"]
        };
    }

    return {
        source_config: {},
        column_mapping: {},
        kpi_rules: {},
        chart_config: {},
        warnings: ["LLM Generation failed. Please configure manually."]
    };
  }
};

export const chatWithData = async (
  context: { headers: string[], samples: any[], config: any },
  messages: { role: string, content: string }[]
) => {
    // Check key early
    if (!process.env.GOOGLE_API_KEY) {
        return "I am running in Demo Mode because the Google API Key is missing. I can see you have columns: " + context.headers.join(', ');
    }

  const systemPrompt = `
    You are a Data Analyst Assistant for Klaroops.
    You have access to a client's dataset configuration.
    
    CONTEXT:
    Headers: ${JSON.stringify(context.headers)}
    Current Config: ${JSON.stringify(context.config)}
    Sample Data: ${JSON.stringify(context.samples.slice(0, 3))}
    
    GOAL:
    Help the user understand the data or adjust the configuration.
    
    CAPABILITIES:
    1. Answer questions about the data structure (e.g. "What columns do we have?").
    2. Suggest configuration changes. If the user asks to "Map 'Qty' to 'Quantity'", return a specific JSON block:
       :::PATCH_CONFIG
       { "column_mapping": { "quantity": "Qty" } }
       :::
    
    RESTRICTIONS:
    - You cannot run live SQL queries yet. Only analyze structure and samples.
    - Be concise and professional.
  `;

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
  }));
  
  const lastMessage = messages[messages.length - 1].content;

  const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
  });

  const chat = model.startChat({
      history: history
  });

  const result = await chat.sendMessage(lastMessage);
  return result.response.text();
};
