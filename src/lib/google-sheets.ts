import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// --- Types ---

export interface SheetScanResult {
  headers: string[];
  sampleRows: Record<string, any>[];
  inferredTypes: Record<string, 'number' | 'date' | 'string' | 'boolean'>;
  sheetId: string;
  tabName: string;
  error?: string;
}

// --- Credentials ---

// Helper to get Auth
const getAuth = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error('Missing Google Service Account credentials');
  }

  return new JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
};

// --- Logic ---

export const parseSheetIdFromUrl = (input: string): string => {
  // Handle full URL
  if (input.includes('docs.google.com/spreadsheets/d/')) {
    const matches = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (matches && matches[1]) return matches[1];
  }
  // Handle direct ID
  if (input.length > 20 && !input.includes('/')) return input;
  
  throw new Error('Invalid Sheet URL or ID');
};

export const scanSheet = async (sheetId: string, tabName?: string): Promise<SheetScanResult> => {
  try {
    const auth = getAuth();
    const doc = new GoogleSpreadsheet(sheetId, auth);
    
    await doc.loadInfo();
    
    let sheet;
    if (tabName) {
      sheet = doc.sheetsByTitle[tabName];
      if (!sheet) throw new Error(`Tab "${tabName}" not found`);
    } else {
      sheet = doc.sheetsByIndex[0]; // Default to first sheet
    }

    // Load Rows
    const rows = await sheet.getRows({ limit: 25 }); // Get first 25 rows
    const headers = sheet.headerValues;

    if (!headers || headers.length === 0) {
      throw new Error('No headers found in sheet');
    }

    // Map to simple objects
    const sampleRows = rows.map(row => {
      const obj: Record<string, any> = {};
      headers.forEach(h => {
        obj[h] = row.get(h);
      });
      return obj;
    });

    // Infer Types
    const inferredTypes: Record<string, 'number' | 'date' | 'string' | 'boolean'> = {};
    
    headers.forEach(header => {
      let isNumber = true;
      let isDate = true;
      let isBool = true;
      let hasData = false;

      // Check first 25 rows
      for (const row of sampleRows) {
        const val = row[header];
        if (val === undefined || val === null || val === '') continue;
        
        hasData = true;
        const strVal = String(val).trim();

        // Check Number
        if (isNaN(Number(strVal.replace(/,/g, '').replace('$', '')))) isNumber = false;
        
        // Check Date
        if (isNaN(Date.parse(strVal))) isDate = false;

        // Check Bool
        if (!['true', 'false', 'yes', 'no', '1', '0'].includes(strVal.toLowerCase())) isBool = false;
      }

      if (!hasData) {
        inferredTypes[header] = 'string';
      } else if (isBool) {
        inferredTypes[header] = 'boolean';
      } else if (isNumber) {
        inferredTypes[header] = 'number';
      } else if (isDate) {
        inferredTypes[header] = 'date';
      } else {
        inferredTypes[header] = 'string';
      }
    });

    return {
      headers,
      sampleRows,
      inferredTypes,
      sheetId,
      tabName: sheet.title
    };

  } catch (error: any) {
    console.error('Error scanning sheet:', error);
    // Mock Fallback for Demo Mode
    if (error.message.includes('Missing Google Service Account')) {
        console.warn('Returning MOCK DATA due to missing credentials');
        return {
            headers: ['Date', 'Product_ID', 'Units_Produced', 'Scrap_Count', 'Operator_Name', 'Shift'],
            sampleRows: [
                { Date: '2023-10-01', Product_ID: 'P-101', Units_Produced: '150', Scrap_Count: '2', Operator_Name: 'John Doe', Shift: 'Morning' },
                { Date: '2023-10-01', Product_ID: 'P-102', Units_Produced: '200', Scrap_Count: '5', Operator_Name: 'Jane Smith', Shift: 'Afternoon' },
                { Date: '2023-10-02', Product_ID: 'P-101', Units_Produced: '145', Scrap_Count: '1', Operator_Name: 'John Doe', Shift: 'Morning' },
            ],
            inferredTypes: {
                Date: 'date',
                Product_ID: 'string',
                Units_Produced: 'number',
                Scrap_Count: 'number',
                Operator_Name: 'string',
                Shift: 'string'
            },
            sheetId: sheetId,
            tabName: 'Demo Data'
        };
    }
    throw error;
  }
};
