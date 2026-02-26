import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Helpers for Excel / financial-statement parsing
// ---------------------------------------------------------------------------

/**
 * Find the actual header row — the first row with at least `minCols` non-empty
 * cells.  Xero / accounting exports often have a title, company name and date
 * range in the first 3-4 rows before the real column headers.
 */
function findHeaderRowIndex(
  rows: any[][],
  minCols: number = 3,
): number {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i];
    if (!row) continue;
    const nonEmpty = row.filter(
      (v) => v !== null && v !== undefined && String(v).trim() !== '',
    );
    if (nonEmpty.length >= minCols) return i;
  }
  return 0; // fallback to first row
}

/**
 * Detect whether a header looks like a percentage / formula column that we
 * should skip.  Xero P&L exports include "Jan 2026 % of Trading Income" next
 * to every period – those columns are always 0 from xlsx because the values
 * are formulas.
 */
function isNoiseColumn(header: string): boolean {
  const h = header.toLowerCase();
  return h.includes('% of') || h.includes('% ') || h === '%';
}

/**
 * Build a clean text representation of a spreadsheet so Claude can understand
 * the financial data.  Outputs markdown-style table + context lines.
 */
function buildCleanText(
  sheetName: string,
  rows: any[][],
  preambleRows: any[][],
): { text: string; preview: Array<{ [key: string]: string }> } {
  // Preamble — title lines above the header
  const preamble = preambleRows
    .map((r) => {
      const cells = (r || []).filter(
        (v: any) => v !== null && v !== undefined && String(v).trim() !== '',
      );
      return cells.map((v: any) => String(v).trim()).join(' — ');
    })
    .filter((l) => l.length > 0);

  const headerRow = rows[0] || [];
  const headers: string[] = headerRow.map((h: any) => String(h ?? '').trim());

  // Figure out which column indexes to keep (skip noisy percentage columns)
  const keepIndexes: number[] = [];
  for (let i = 0; i < headers.length; i++) {
    if (headers[i] && !isNoiseColumn(headers[i])) {
      keepIndexes.push(i);
    }
  }

  const cleanHeaders = keepIndexes.map((i) => headers[i]);
  const dataRows = rows.slice(1);

  // Build text
  let text = '';
  if (preamble.length > 0) {
    text += preamble.join('\n') + '\n\n';
  }
  text +=
    'NOTE: Total / subtotal rows marked "(calculated)" are spreadsheet formulas that could not be evaluated during extraction. Calculate them from the line items above.\n\n';
  text += `Sheet: ${sheetName}\n`;
  text += `Columns: ${cleanHeaders.join(' | ')}\n`;
  text += '-'.repeat(Math.min(cleanHeaders.join(' | ').length, 120)) + '\n';

  const preview: Array<{ [key: string]: string }> = [];

  // Index of the "Account" / label column (first column)
  const labelIdx = keepIndexes[0];
  const numericIdxs = keepIndexes.slice(1);

  for (const row of dataRows) {
    const rowArr: any[] = Array.isArray(row) ? row : [];
    // Skip completely empty rows
    const hasContent = keepIndexes.some((i) => {
      const v = rowArr[i];
      return v !== null && v !== undefined && String(v).trim() !== '';
    });
    if (!hasContent) continue;

    // Detect "Total …" / "Gross Profit" / "Net Profit" rows where all
    // numeric cells are 0 — these are formula rows Xero exports that xlsx
    // can't evaluate.  Replace zeros with "(calculated)" so Claude knows
    // it should compute the value from the line items above.
    const label = String(rowArr[labelIdx] ?? '').trim().toLowerCase();
    const isTotalRow =
      label.startsWith('total') ||
      label === 'gross profit' ||
      label === 'net profit' ||
      label === 'net profit (loss)' ||
      label === 'net profit/(loss)';
    const allNumericZero =
      isTotalRow &&
      numericIdxs.every((i) => {
        const v = rowArr[i];
        return v === 0 || v === '' || v === null || v === undefined;
      });

    const values = keepIndexes.map((i) => {
      const v = rowArr[i];
      if (v === null || v === undefined) return '';
      // If this is a total row with all zeros, show "(calculated)"
      if (allNumericZero && i !== labelIdx) return '(calculated)';
      // Format numbers nicely
      if (typeof v === 'number') {
        return v % 1 === 0
          ? v.toLocaleString('en-ZA')
          : v.toLocaleString('en-ZA', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
      }
      return String(v).trim();
    });

    text += values.join(' | ') + '\n';

    // Build preview (first 5 data rows with actual values)
    if (preview.length < 5) {
      const obj: { [key: string]: string } = {};
      cleanHeaders.forEach((h, idx) => {
        obj[h] = values[idx];
      });
      preview.push(obj);
    }
  }

  return { text, preview };
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

    // ----- CSV ----- //
    if (fileName.endsWith('.csv')) {
      const text = await file.text();
      extractedText = text;

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

        const { text, preview: sheetPreview } = buildCleanText(
          sheetName,
          dataBlock,
          preambleRows,
        );
        parts.push(text);

        // Use the first sheet's preview for the API response
        if (si === 0 && sheetPreview.length > 0) {
          preview = sheetPreview;
        }
      }

      extractedText = parts.join('\n\n');

    // ----- PDF ----- //
    } else if (fileName.endsWith('.pdf')) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;

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
    });
  } catch (error: any) {
    console.error('File parse error:', error);
    return NextResponse.json(
      { success: false, error: `Failed to parse file: ${error.message}` },
      { status: 500 },
    );
  }
}
