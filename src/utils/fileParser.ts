import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FileMetadata, FileType } from '../types';

export interface ParseResult {
  headers: string[];
  rows: Record<string, any>[];
  metadata: FileMetadata;
}

export function parseCsvContent(content: string, fileName = 'dataset.csv', fileSize = 0): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(content, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const rows = (results.data || []).filter((row) => Object.keys(row).length > 0);
        const headers = results.meta.fields || (rows.length > 0 ? Object.keys(rows[0]) : []);
        
        resolve({
          headers,
          rows,
          metadata: {
            name: fileName,
            size: fileSize || new Blob([content]).size,
            type: 'csv',
            rowCount: rows.length,
            columnCount: headers.length,
          },
        });
      },
      error: (error: any) => reject(error),
    });
  });
}

export function parseExcelBuffer(buffer: ArrayBuffer, fileName = 'dataset.xlsx', targetSheet?: string): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetNames = workbook.SheetNames;
  
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('No sheets found in Excel file');
  }

  const activeSheet = targetSheet && sheetNames.includes(targetSheet) ? targetSheet : sheetNames[0];
  const worksheet = workbook.Sheets[activeSheet];
  
  // Convert worksheet to JSON rows
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: null,
    raw: false,
    dateNF: 'yyyy-mm-dd',
  });

  const headers: string[] = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];

  return {
    headers,
    rows: rawRows,
    metadata: {
      name: fileName,
      size: buffer.byteLength,
      type: fileName.endsWith('.xls') ? 'xls' : 'xlsx',
      sheetNames,
      activeSheet,
      rowCount: rawRows.length,
      columnCount: headers.length,
    },
  };
}

export function parseJsonContent(content: string, fileName = 'dataset.json', fileSize = 0): ParseResult {
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    // Attempt parsing as JSON Lines (NDJSON)
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    parsed = lines.map((line) => JSON.parse(line));
  }

  let rows: Record<string, any>[] = [];

  if (Array.isArray(parsed)) {
    rows = parsed;
  } else if (parsed && typeof parsed === 'object') {
    // Check if there is an array property like "data", "records", "items", "results"
    const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
    if (arrayKey && Array.isArray(parsed[arrayKey])) {
      rows = parsed[arrayKey];
    } else {
      // Single object as single row
      rows = [parsed];
    }
  }

  // Flatten nested objects into dot-notation headers if needed, or collect unique keys
  const headerSet = new Set<string>();
  rows.forEach((r) => {
    if (r && typeof r === 'object') {
      Object.keys(r).forEach((k) => headerSet.add(k));
    }
  });

  const headers = Array.from(headerSet);

  return {
    headers,
    rows,
    metadata: {
      name: fileName,
      size: fileSize || new Blob([content]).size,
      type: 'json',
      rowCount: rows.length,
      columnCount: headers.length,
    },
  };
}

export async function parseUploadedFile(file: File, sheetName?: string): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    const text = await file.text();
    return parseCsvContent(text, file.name, file.size);
  } else if (extension === 'xlsx' || extension === 'xls') {
    const buffer = await file.arrayBuffer();
    return parseExcelBuffer(buffer, file.name, sheetName);
  } else if (extension === 'json') {
    const text = await file.text();
    return parseJsonContent(text, file.name, file.size);
  } else {
    throw new Error(`Unsupported file type: .${extension}. Please provide CSV, Excel (.xlsx, .xls) or JSON.`);
  }
}
