import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Helpers for Excel / financial-statement parsing
// ---------------------------------------------------------------------------

/**
 * Format a number with commas — locale-independent so it works reliably
 * in Vercel serverless environments where ICU data may be missing.
 */
function fmtNum(v: number): string {
  const isNeg = v < 0;
  const abs = Math.abs(v);
  let str: string;
  if (abs % 1 === 0) {
    str = abs.toFixed(0);
  } else {
    str = abs.toFixed(2);
  }
  str = str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return isNeg ? `-${str}` : str;
}

/**
 * Find the actual header row — first row with at least `minCols` non-empty
 * cells.  Xero / accounting exports often have title rows before real headers.
 */
function findHeaderRowIndex(rows: any[][], minCols: number = 3): number {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i];
    if (!row) continue;
    const nonEmpty = row.filter(
      (v) => v !== null && v !== undefined && String(v).trim() !== '',
    );
    if (nonEmpty.length >= minCols) return i;
  }
  return 0;
}

/**
 * Detect percentage / formula columns to skip.
 */
function isNoiseColumn(header: string): boolean {
  const h = header.toLowerCase();
  return h.includes('% of') || h.includes('% ') || h === '%';
}

/**
 * Detect entity (company) from preamble text and filename.
 */
function detectEntity(
  preambleText: string,
  fileName: string,
): string | null {
  const combined = (preambleText + ' ' + fileName).toLowerCase();
  if (combined.includes('tech revival')) return 'Tech Revival';
  if (combined.includes('recommerce')) return 'ReCommerce SA';
  return null;
}

/** Row labels that are section headers (no numeric values expected). */
function isSectionHeader(label: string): boolean {
  const l = label.toLowerCase().trim();
  const sections = [
    'trading income',
    'cost of sales',
    'cost of goods sold',
    'operating expenses',
    'other expenses',
    'other income',
    'other revenue',
    'expenses',
    'revenue',
    'income',
    'direct costs',
    'less cost of sales',
    'less operating expenses',
  ];
  return sections.includes(l);
}

/** Row labels that are totals / subtotals. */
function isTotalLabel(label: string): boolean {
  const l = label.toLowerCase().trim();
  return (
    l.startsWith('total') ||
    l === 'gross profit' ||
    l === 'gross profit (loss)' ||
    l === 'net profit' ||
    l === 'net profit (loss)' ||
    l === 'net profit/(loss)' ||
    l === 'operating profit' ||
    l === 'operating profit (loss)' ||
    l === 'ebitda'
  );
}

/**
 * Build clean text representation of a spreadsheet.
 *
 * Key improvement: computes totals for formula rows that xlsx can't evaluate
 * (Xero exports total rows as formulas which show as 0 in xlsx).
 */
function buildCleanText(
  sheetName: string,
  rows: any[][],
  preambleRows: any[][],
): {
  text: string;
  preview: Array<{ [key: string]: string }>;
  detectedEntity: string | null;
} {
  // Preamble — title lines above the header
  const preamble = preambleRows
    .map((r) => {
      const cells = (r || []).filter(
        (v: any) => v !== null && v !== undefined && String(v).trim() !== '',
      );
      return cells.map((v: any) => String(v).trim()).join(' — ');
    })
    .filter((l) => l.length > 0);

  const detectedEntity = detectEntity(preamble.join(' '), sheetName);

  const headerRow = rows[0] || [];
  const headers: string[] = headerRow.map((h: any) => String(h ?? '').trim());

  // Determine which columns to keep (skip noise / percentage columns)
  const keepIndexes: number[] = [];
  for (let i = 0; i < headers.length; i++) {
    if (headers[i] && !isNoiseColumn(headers[i])) {
      keepIndexes.push(i);
    }
  }

  const cleanHeaders = keepIndexes.map((i) => headers[i]);
  const dataRows = rows.slice(1);

  const labelIdx = keepIndexes[0];
  const numericIdxs = keepIndexes.slice(1);

  // ---- First pass: collect structured data and compute totals ----
  interface ProcessedRow {
    label: string;
    values: Map<number, number | string>; // index → value
    isSection: boolean;
    isTotal: boolean;
    computed: boolean; // whether we computed the total ourselves
  }

  const processed: ProcessedRow[] = [];

  // Running accumulator for each numeric column
  const acc: Map<number, number> = new Map();
  numericIdxs.forEach((i) => acc.set(i, 0));
  function resetAcc() {
    numericIdxs.forEach((i) => acc.set(i, 0));
  }

  // Store named section totals for cross-section calculations (Gross Profit, Net Profit)
  const sectionTotals: Map<string, Map<number, number>> = new Map();

  for (const row of dataRows) {
    const rowArr: any[] = Array.isArray(row) ? row : [];
    const hasContent = keepIndexes.some((i) => {
      const v = rowArr[i];
      return v !== null && v !== undefined && String(v).trim() !== '';
    });
    if (!hasContent) continue;

    const label = String(rowArr[labelIdx] ?? '').trim();
    const labelLower = label.toLowerCase().trim();

    // Build a value map for this row
    const vals = new Map<number, number | string>();
    vals.set(labelIdx, label);
    numericIdxs.forEach((i) => {
      const v = rowArr[i];
      if (v === null || v === undefined || v === '') {
        vals.set(i, '');
      } else if (typeof v === 'number') {
        vals.set(i, v);
      } else {
        vals.set(i, String(v).trim());
      }
    });

    // Section header
    if (isSectionHeader(label)) {
      resetAcc();
      processed.push({ label, values: vals, isSection: true, isTotal: false, computed: false });
      continue;
    }

    const isTotal = isTotalLabel(label);
    const allNumericZero =
      isTotal &&
      numericIdxs.every((i) => {
        const v = vals.get(i);
        return v === 0 || v === '' || v === undefined;
      });

    if (isTotal && allNumericZero) {
      // ---- Compute the total from accumulated line items ----
      const computed = new Map<number, number>();
      numericIdxs.forEach((i) => computed.set(i, acc.get(i) || 0));

      const isGrossProfit =
        labelLower === 'gross profit' || labelLower === 'gross profit (loss)';
      const isNetProfit =
        labelLower.startsWith('net profit') ||
        labelLower === 'operating profit' ||
        labelLower === 'operating profit (loss)';

      if (isGrossProfit) {
        const tradingIncome =
          sectionTotals.get('trading income') ||
          sectionTotals.get('income') ||
          sectionTotals.get('revenue');
        const costOfSales =
          sectionTotals.get('cost of sales') ||
          sectionTotals.get('cost of goods sold') ||
          sectionTotals.get('direct costs');
        if (tradingIncome) {
          numericIdxs.forEach((i) => {
            const income = tradingIncome.get(i) || 0;
            const costs = costOfSales ? costOfSales.get(i) || 0 : 0;
            computed.set(i, income - costs);
          });
        }
        sectionTotals.set('_gross_profit', new Map(computed));
      } else if (isNetProfit) {
        const gp = sectionTotals.get('_gross_profit');
        const opex =
          sectionTotals.get('operating expenses') ||
          sectionTotals.get('expenses') ||
          sectionTotals.get('other expenses');
        if (gp) {
          numericIdxs.forEach((i) => {
            const gpVal = gp.get(i) || 0;
            const opexVal = opex ? opex.get(i) || 0 : 0;
            computed.set(i, gpVal - opexVal);
          });
        }
        sectionTotals.set('_net_profit', new Map(computed));
      }

      // Save section total for cross-section calculations
      if (labelLower.startsWith('total ')) {
        const sectionName = labelLower.replace('total ', '').trim();
        sectionTotals.set(sectionName, new Map(computed));
      }

      // Build the computed row values
      const computedVals = new Map<number, number | string>();
      computedVals.set(labelIdx, label);
      numericIdxs.forEach((i) => computedVals.set(i, computed.get(i) || 0));

      processed.push({
        label,
        values: computedVals,
        isSection: false,
        isTotal: true,
        computed: true,
      });
      resetAcc();
    } else if (isTotal) {
      // Total row with actual values — use as-is and save for cross-section calcs
      if (labelLower.startsWith('total ')) {
        const sectionName = labelLower.replace('total ', '').trim();
        const m = new Map<number, number>();
        numericIdxs.forEach((i) => {
          const v = vals.get(i);
          m.set(i, typeof v === 'number' ? v : 0);
        });
        sectionTotals.set(sectionName, m);
      }
      processed.push({ label, values: vals, isSection: false, isTotal: true, computed: false });
      resetAcc();
    } else {
      // Regular line item — add to accumulator
      numericIdxs.forEach((i) => {
        const v = vals.get(i);
        if (typeof v === 'number') {
          acc.set(i, (acc.get(i) || 0) + v);
        }
      });
      processed.push({ label, values: vals, isSection: false, isTotal: false, computed: false });
    }
  }

  // ---- Second pass: build text output ----
  let text = '';
  if (preamble.length > 0) {
    text += preamble.join('\n') + '\n\n';
  }
  text += `Sheet: ${sheetName}\n`;
  text += `Columns: ${cleanHeaders.join(' | ')}\n`;
  text += '-'.repeat(Math.min(cleanHeaders.join(' | ').length, 120)) + '\n';

  const preview: Array<{ [key: string]: string }> = [];
  let previewCount = 0;

  for (const pRow of processed) {
    const parts = keepIndexes.map((i) => {
      const v = pRow.values.get(i);
      if (v === null || v === undefined || v === '') return '';
      if (typeof v === 'number') return fmtNum(v);
      return String(v);
    });

    // Bold-ish total rows with ** markers for Claude's attention
    if (pRow.isTotal) {
      parts[0] = `**${parts[0]}**`;
    }

    text += parts.join(' | ') + '\n';

    // Preview: first 5 non-section rows
    if (!pRow.isSection && previewCount < 5) {
      const obj: { [key: string]: string } = {};
      cleanHeaders.forEach((h, idx) => {
        const v = pRow.values.get(keepIndexes[idx]);
        if (v === null || v === undefined || v === '') {
          obj[h] = '';
        } else if (typeof v === 'number') {
          obj[h] = fmtNum(v);
        } else {
          obj[h] = String(v);
        }
      });
      preview.push(obj);
      previewCount++;
    }
  }

  // Append data summary
  const dataRowCount = processed.filter((r) => !r.isSection).length;
  const periodCount = numericIdxs.length;
  text += `\n--- ${dataRowCount} line items across ${periodCount} period(s) ---\n`;

  return { text, preview, detectedEntity };
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 },
      );
    }

    const fileName = file.name.toLowerCase();
    let extractedText = '';
    let preview: Array<{ [key: string]: string }> = [];
    let detectedEntity: string | null = null;

    // ----- CSV ----- //
    if (fileName.endsWith('.csv')) {
      const text = await file.text();
      extractedText = text;
      detectedEntity = detectEntity(text.substring(0, 500), file.name);

      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length > 0) {
        const headers = lines[0]
          .split(',')
          .map((h) => h.trim().replace(/^["']|["']$/g, ''));
        preview = lines.slice(1, 6).map((line) => {
          const values = line
            .split(',')
            .map((v) => v.trim().replace(/^["']|["']$/g, ''));
          const row: { [key: string]: string } = {};
          headers.forEach((h, i) => {
            row[h] = values[i] || '';
          });
          return row;
        });
      }

      // ----- EXCEL ----- //
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const { read, utils } = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer, { type: 'array' });

      const parts: string[] = [];

      for (
        let si = 0;
        si < Math.min(workbook.SheetNames.length, 5);
        si++
      ) {
        const sheetName = workbook.SheetNames[si];
        const sheet = workbook.Sheets[sheetName];
        const allRows: any[][] = utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
        });

        if (allRows.length === 0) continue;

        // Find where the real column headers are
        const headerIdx = findHeaderRowIndex(allRows);
        const preambleRows = allRows.slice(0, headerIdx);
        const dataBlock = allRows.slice(headerIdx);

        const {
          text,
          preview: sheetPreview,
          detectedEntity: sheetEntity,
        } = buildCleanText(sheetName, dataBlock, preambleRows);
        parts.push(text);

        // Use the first sheet's preview and entity for the API response
        if (si === 0) {
          if (sheetPreview.length > 0) preview = sheetPreview;
          if (sheetEntity) detectedEntity = sheetEntity;
        }
      }

      extractedText = parts.join('\n\n');

      // ----- PDF ----- //
    } else if (fileName.endsWith('.pdf')) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
      detectedEntity = detectEntity(extractedText.substring(0, 1000), file.name);

      const lines = extractedText
        .split('\n')
        .filter((l) => l.trim())
        .slice(0, 10);
      preview = lines.map((line, i) => ({
        Line: String(i + 1),
        Content: line.trim().substring(0, 100),
      }));

      // ----- TXT / DOC ----- //
    } else if (
      fileName.endsWith('.txt') ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.docx')
    ) {
      extractedText = await file.text();
      detectedEntity = detectEntity(extractedText.substring(0, 500), file.name);

      const lines = extractedText
        .split('\n')
        .filter((l) => l.trim())
        .slice(0, 10);
      preview = lines.map((line, i) => ({
        Line: String(i + 1),
        Content: line.trim().substring(0, 100),
      }));

      // ----- FALLBACK ----- //
    } else {
      extractedText = await file.text();
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      extractedText: extractedText.substring(0, 50000),
      preview,
      rowCount: extractedText.split('\n').filter((l) => l.trim()).length,
      detectedEntity,
    });
  } catch (error: any) {
    console.error('File parse error:', error);
    return NextResponse.json(
      { success: false, error: `Failed to parse file: ${error.message}` },
      { status: 500 },
    );
  }
}
