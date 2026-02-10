import { GoogleSpreadsheet } from 'google-spreadsheet';
import { getGoogleAccessToken } from './google-auth';
import { OAuth2Client } from 'google-auth-library';

// --- Types ---

export interface SheetProfile {
  sheet: string;
  headers: string[];
  sampleRows: Record<string, any>[];
  inferredTypes: Record<string, 'number' | 'date' | 'string' | 'boolean'>;
}

export interface MultiSheetScanResult {
  spreadsheetId: string;
  availableSheets: string[];
  selectedSheets: string[];
  profiles: SheetProfile[];
  error?: string;
}

export interface SheetScanResult {
  headers: string[];
  sampleRows: Record<string, any>[];
  inferredTypes: Record<string, 'number' | 'date' | 'string' | 'boolean'>;
  sheetId: string;
  tabName: string;
  error?: string;
}

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

export const scanSheetsMulti = async (
    sheetId: string, 
    selectedSheets: string[] = []
): Promise<MultiSheetScanResult> => {
  try {
    const accessToken = await getGoogleAccessToken();
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const doc = new GoogleSpreadsheet(sheetId, oauth2Client);
    await doc.loadInfo();

    const availableSheets = doc.sheetsByIndex.map(s => s.title);
    
    // Determine which sheets to read
    let sheetsToRead = selectedSheets;
    if (!sheetsToRead || sheetsToRead.length === 0) {
        // If no selection, we default to NONE, but user wants to "scan default first".
        // Requirement: "si selected_sheets existe → leer SOLO esas; si no → leer solo la primera"
        sheetsToRead = [availableSheets[0]];
    }

    const profiles: SheetProfile[] = [];

    for (const title of sheetsToRead) {
        const sheet = doc.sheetsByTitle[title];
        if (!sheet) continue;

        const rows = await sheet.getRows({ limit: 25 });
        const headers = sheet.headerValues;

        if (!headers || headers.length === 0) continue;

        // Map rows
        const sampleRows = rows.map(row => {
            const obj: Record<string, any> = {};
            headers.forEach(h => { obj[h] = row.get(h); });
            return obj;
        });

        // Infer Types
        const inferredTypes: Record<string, 'number' | 'date' | 'string' | 'boolean'> = {};
        headers.forEach(header => {
            let isNumber = true;
            let isDate = true;
            let isBool = true;
            let hasData = false;

            for (const row of sampleRows) {
                const val = row[header];
                if (val === undefined || val === null || val === '') continue;
                hasData = true;
                const strVal = String(val).trim();
                if (isNaN(Number(strVal.replace(/,/g, '').replace('$', '')))) isNumber = false;
                if (isNaN(Date.parse(strVal))) isDate = false;
                if (!['true', 'false', 'yes', 'no', '1', '0'].includes(strVal.toLowerCase())) isBool = false;
            }

            if (!hasData) inferredTypes[header] = 'string';
            else if (isBool) inferredTypes[header] = 'boolean';
            else if (isNumber) inferredTypes[header] = 'number';
            else if (isDate) inferredTypes[header] = 'date';
            else inferredTypes[header] = 'string';
        });

        profiles.push({
            sheet: title,
            headers,
            sampleRows,
            inferredTypes
        });
    }

    return {
        spreadsheetId: sheetId,
        availableSheets,
        selectedSheets: sheetsToRead,
        profiles
    };

  } catch (error: any) {
    console.error('Error scanning sheets:', error);
    
    if (error.response?.status === 403 || error.message.includes('caller does not have permission')) {
        throw new Error(`Sheet not shared with system@klaroops.com. Please share the sheet with Viewer access.`);
    }
    if (error.message.includes('Google Sheets integration not connected')) {
        throw new Error('Google Sheets integration not connected. Please connect system@klaroops.com in Admin Settings.');
    }
    throw error;
  }
};

// Backward Compatibility Wrapper
export const scanSheet = async (sheetId: string, tabName?: string): Promise<SheetScanResult> => {
    // We use scanSheetsMulti to get the first sheet or specific tab
    const selected = tabName ? [tabName] : [];
    const result = await scanSheetsMulti(sheetId, selected);

    if (result.profiles.length === 0) {
        throw new Error('No data found in sheet');
    }
    
    // Return first profile in legacy format
    const p = result.profiles[0];
    return {
        headers: p.headers,
        sampleRows: p.sampleRows,
        inferredTypes: p.inferredTypes,
        sheetId: result.spreadsheetId,
        tabName: p.sheet
    };
};
