import Papa from 'papaparse';
import * as XLSX from 'xlsx';
// @ts-ignore
import pdfParse from 'pdf-parse';
import { extractDataFromImage } from '@/lib/claude';
import { ParsedData, DataSourceType } from '@/types';

/**
 * Parse CSV file and extract structured data
 */
export async function parseCSV(
  file: Buffer,
  options?: {
    delimiter?: string;
    headers?: boolean;
    skipEmpty?: boolean;
  },
): Promise<ParsedData> {
  const { delimiter = ',', headers = true, skipEmpty = true } = options || {};

  try {
    const content = file.toString('utf-8');

    return new Promise((resolve, reject) => {
      Papa.parse(content, {
        delimiter,
        header: headers,
        skipEmptyLines: skipEmpty,
        complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
          if (!results.data || results.data.length === 0) {
            resolve({
              columns: [],
              rows: [],
              preview: [],
              stats: {
                rowCount: 0,
                columnCount: 0,
              },
            });
            return;
          }

          const records = results.data as Record<string, unknown>[];
          const columns = headers && records.length > 0 ? Object.keys(records[0]) : [];
          const preview = records.slice(0, 5);

          resolve({
            columns,
            rows: records,
            preview,
            stats: {
              rowCount: records.length,
              columnCount: columns.length,
            },
          });
        },
        error: (error: Error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        },
      });
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`CSV parsing failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Parse Excel file and extract structured data
 */
export async function parseExcel(
  file: Buffer,
  options?: {
    sheetIndex?: number;
    hasHeader?: boolean;
  },
): Promise<ParsedData> {
  const { sheetIndex = 0, hasHeader = true } = options || {};

  try {
    const workbook = XLSX.read(file, { type: 'buffer' });

    const sheetName = workbook.SheetNames[sheetIndex];
    if (!sheetName) {
      throw new Error(`Sheet at index ${sheetIndex} not found`);
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
      header: hasHeader ? undefined : 0,
    }) as Record<string, unknown>[];

    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    const preview = rows.slice(0, 5);

    return {
      columns,
      rows,
      preview,
      stats: {
        rowCount: rows.length,
        columnCount: columns.length,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Excel parsing failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Extract text content from PDF
 */
export async function parsePDF(file: Buffer): Promise<ParsedData> {
  try {
    const pdfData = await pdfParse(file);

    const text = pdfData.text as string;
    const lines = text.split('\n').filter((line: string) => line.trim());

    // Try to detect tables (simple heuristic: lines with multiple spaces)
    const rows: Record<string, unknown>[] = lines.map((line: string, index: number) => ({
      page: Math.floor(index / 50) + 1,
      line: index + 1,
      text: line,
    }));

    return {
      columns: ['page', 'line', 'text'],
      rows,
      preview: rows.slice(0, 5),
      stats: {
        rowCount: rows.length,
        columnCount: 3,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Process screenshot image and extract data using Claude vision
 */
export async function processScreenshot(imageBase64: string, context: string): Promise<any> {
  try {
    const result = await extractDataFromImage({
      imageBase64,
      context,
    });

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Screenshot processing failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Detect file type from magic bytes and filename
 */
export function detectFileType(file: Buffer, filename: string): DataSourceType {
  const name = filename.toLowerCase();

  // Check magic bytes
  if (file.length >= 4) {
    // PDF: %PDF
    if (file[0] === 0x25 && file[1] === 0x50 && file[2] === 0x44 && file[3] === 0x46) {
      return 'PDF';
    }

    // Excel: PK (ZIP format) or specific Excel magic bytes
    if (
      (file[0] === 0x50 && file[1] === 0x4b) ||
      (file[0] === 0xd0 && file[1] === 0xcf)
    ) {
      if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        return 'EXCEL';
      }
    }

    // PNG: 89 50 4E 47
    if (file[0] === 0x89 && file[1] === 0x50 && file[2] === 0x4e && file[3] === 0x47) {
      return 'SCREENSHOT';
    }

    // JPEG: FF D8 FF
    if (file[0] === 0xff && file[1] === 0xd8 && file[2] === 0xff) {
      return 'SCREENSHOT';
    }
  }

  // Fall back to filename extension
  if (name.endsWith('.csv')) return 'CSV';
  if (name.endsWith('.pdf')) return 'PDF';
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'EXCEL';
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'SCREENSHOT';
  if (name.endsWith('.json')) return 'CSV';

  throw new Error(`Unknown file type: ${filename}`);
}

/**
 * Normalize parsed data to a standard schema
 */
export function normalizeData(
  parsedData: ParsedData,
  targetSchema: string,
): Record<string, unknown>[] {
  const normalized = parsedData.rows.map((row) => {
    const normalized: Record<string, unknown> = {};

    // Convert currency values (remove $ and commas)
    // Convert percentages (remove %)
    // Trim whitespace
    for (const [key, value] of Object.entries(row)) {
      if (value === null || value === undefined || value === '') {
        normalized[key] = null;
      } else if (typeof value === 'string') {
        const trimmed = value.trim();

        // Try currency conversion
        if (trimmed.match(/^\$?[\d,]+\.?\d*%?$/)) {
          const numeric = parseFloat(trimmed.replace(/[$,% ]/g, ''));
          normalized[key] = isNaN(numeric) ? trimmed : numeric;
        } else {
          normalized[key] = trimmed;
        }
      } else {
        normalized[key] = value;
      }
    }

    return normalized;
  });

  return normalized;
}

/**
 * Validate data against required fields
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: string[];
}

export function validateData(data: any[], requiredFields: string[]): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: [{ row: 0, field: 'data', message: 'Data must be an array' }],
      warnings,
    };
  }

  if (data.length === 0) {
    warnings.push('Data is empty');
  }

  data.forEach((row, rowIndex) => {
    requiredFields.forEach((field) => {
      const value = row[field];

      if (value === null || value === undefined || value === '') {
        errors.push({
          row: rowIndex + 1,
          field,
          message: `Required field '${field}' is missing or empty`,
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Main ingestion function that orchestrates the complete pipeline
 */
export interface IngestionOptions {
  requiredFields?: string[];
  targetSchema?: string;
  fileContext?: string;
}

export async function ingestFile(
  file: File | Buffer,
  filename: string,
  context?: string,
  options?: IngestionOptions,
): Promise<{
  data: ParsedData;
  fileType: DataSourceType;
  validation: ValidationResult;
  normalized: Record<string, unknown>[];
  metadata: {
    filename: string;
    fileType: DataSourceType;
    uploadedAt: Date;
    rowCount: number;
    columnCount: number;
  };
}> {
  const { requiredFields = [], targetSchema = 'standard', fileContext = context } = options || {};

  try {
    // Convert File to Buffer if needed
    let buffer: Buffer;
    if (file instanceof File) {
      buffer = Buffer.from(await file.arrayBuffer());
    } else {
      buffer = file;
    }

    // Detect file type
    const fileType = detectFileType(buffer, filename);

    // Parse based on file type
    let parsedData: ParsedData;

    switch (fileType) {
      case 'CSV':
        parsedData = await parseCSV(buffer);
        break;
      case 'EXCEL':
        parsedData = await parseExcel(buffer);
        break;
      case 'PDF':
        parsedData = await parsePDF(buffer);
        break;
      case 'IMAGE':
        const imageBase64 = buffer.toString('base64');
        const imageData = await processScreenshot(imageBase64, fileContext || '');
        parsedData = {
          columns: Object.keys(imageData),
          rows: [imageData],
          preview: [imageData],
          stats: {
            rowCount: 1,
            columnCount: Object.keys(imageData).length,
          },
        };
        break;
      case 'JSON':
        const jsonContent = JSON.parse(buffer.toString('utf-8'));
        const jsonArray = Array.isArray(jsonContent) ? jsonContent : [jsonContent];
        parsedData = {
          columns: jsonArray.length > 0 ? Object.keys(jsonArray[0]) : [],
          rows: jsonArray,
          preview: jsonArray.slice(0, 5),
          stats: {
            rowCount: jsonArray.length,
            columnCount: jsonArray.length > 0 ? Object.keys(jsonArray[0]).length : 0,
          },
        };
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Normalize data
    const normalized = normalizeData(parsedData, targetSchema);

    // Validate
    const validation = validateData(normalized, requiredFields);

    return {
      data: parsedData,
      fileType,
      validation,
      normalized,
      metadata: {
        filename,
        fileType,
        uploadedAt: new Date(),
        rowCount: parsedData.stats.rowCount,
        columnCount: parsedData.stats.columnCount,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`File ingestion failed: ${error.message}`);
    }
    throw error;
  }
}
