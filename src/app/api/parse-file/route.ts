import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    let extractedText = '';
    let preview: Array<{ [key: string]: string }> = [];

    if (fileName.endsWith('.csv')) {
      // Parse CSV
      const text = await file.text();
      extractedText = text;

      // Build preview from first few rows
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
        preview = lines.slice(1, 6).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
          const row: { [key: string]: string } = {};
          headers.forEach((h, i) => {
            row[h] = values[i] || '';
          });
          return row;
        });
      }
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Parse Excel using xlsx
      const { read, utils } = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer, { type: 'array' });

      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = utils.sheet_to_json<{ [key: string]: any }>(sheet, { header: 1 });

      if (jsonData.length > 0) {
        const headers = (jsonData[0] as any[]).map((h: any) => String(h || '').trim());
        const dataRows = jsonData.slice(1);

        // Build text representation
        extractedText = `Spreadsheet: ${sheetName}\n`;
        extractedText += `Columns: ${headers.join(', ')}\n\n`;

        dataRows.forEach((row: any) => {
          const rowArr = row as any[];
          const rowObj: { [key: string]: string } = {};
          headers.forEach((h, i) => {
            const val = String(rowArr[i] ?? '').trim();
            rowObj[h] = val;
          });
          extractedText += headers.map((h, i) => `${h}: ${rowArr[i] ?? ''}`).join(' | ') + '\n';
          if (preview.length < 5) {
            preview.push(rowObj);
          }
        });

        // Also process additional sheets
        for (let i = 1; i < Math.min(workbook.SheetNames.length, 5); i++) {
          const extraSheet = workbook.Sheets[workbook.SheetNames[i]];
          const extraData = utils.sheet_to_json<{ [key: string]: any }>(extraSheet, { header: 1 });
          if (extraData.length > 0) {
            const extraHeaders = (extraData[0] as any[]).map((h: any) => String(h || '').trim());
            extractedText += `\n\nSheet: ${workbook.SheetNames[i]}\n`;
            extractedText += `Columns: ${extraHeaders.join(', ')}\n\n`;
            extraData.slice(1).forEach((row: any) => {
              const rowArr = row as any[];
              extractedText += extraHeaders.map((h, j) => `${h}: ${rowArr[j] ?? ''}`).join(' | ') + '\n';
            });
          }
        }
      }
    } else if (fileName.endsWith('.pdf')) {
      // Parse PDF
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;

      // Build a simple preview from first few lines
      const lines = extractedText.split('\n').filter((l) => l.trim()).slice(0, 10);
      preview = lines.map((line, i) => ({
        Line: String(i + 1),
        Content: line.trim().substring(0, 100),
      }));
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      // Read text-based files (bookkeeper notes, reports, etc.)
      extractedText = await file.text();

      // Build preview from first few lines
      const lines = extractedText.split('\n').filter((l) => l.trim()).slice(0, 10);
      preview = lines.map((line, i) => ({
        Line: String(i + 1),
        Content: line.trim().substring(0, 100),
      }));
    } else {
      // Try to read as text
      extractedText = await file.text();
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      extractedText: extractedText.substring(0, 50000), // Cap at 50k chars
      preview,
      rowCount: extractedText.split('\n').filter((l) => l.trim()).length,
    });
  } catch (error: any) {
    console.error('File parse error:', error);
    return NextResponse.json(
      { success: false, error: `Failed to parse file: ${error.message}` },
      { status: 500 }
    );
  }
}
