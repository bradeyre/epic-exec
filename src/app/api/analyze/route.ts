import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

function getApiKey(): string {
  // First try process.env
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 10) {
    return process.env.ANTHROPIC_API_KEY;
  }
  // Fallback: read directly from .env.local
  try {
    const envPath = join(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
  // Fallback: read from .env
  try {
    const envPath = join(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
  return '';
}

interface AnalyzeRequest {
  functionSlug: string;
  functionName: string;
  category: string;
  companyContext: {
    companyName: string;
    industry: string;
    primaryGoal: string;
    targetGeography: string;
    additionalContext: string;
  };
  uploadedData: string;
  focusAreas: string[];
  additionalFocus: string;
}

function buildCFOPrompt(req: AnalyzeRequest): string {
  const focusList = req.focusAreas.length > 0
    ? req.focusAreas.map((a) => `- ${a}`).join('\n')
    : '- General overview';

  const isCombined = req.companyContext.companyName === 'Combined';
  const entityNote = isCombined
    ? '\n\nIMPORTANT: This is a COMBINED analysis for two entities (Tech Revival Pty Ltd and ReCommerce SA Pty Ltd) operating as one group. If data is uploaded for separate entities (marked with [Entity: ...] tags), combine and consolidate the figures to provide a unified group-level view. Highlight any inter-entity differences and provide consolidated totals.'
    : '';

  const isAdvisory = req.functionSlug === 'cfo-advisory';

  const roleDescription = isAdvisory
    ? `You are a top-tier fractional CFO who has been hired to advise a South African business that is heading toward R100 million per year in revenue. You think strategically, cut through noise, and tell the founder exactly what matters most right now. You are direct, practical, and focused on what will move the needle. You must respond ONLY with valid JSON — no markdown, no code fences, no commentary outside the JSON.`
    : `You are an expert fractional CFO providing financial analysis for a South African business. You must respond ONLY with valid JSON — no markdown, no code fences, no commentary outside the JSON.`;

  const dataAwarenessRule = `
- CRITICAL: Before analyzing each focus area, assess whether the uploaded data actually supports that analysis. If a focus area requires data you don't have (e.g. "YoY Comparisons" but only one month's data is provided, or "Cash Flow" but only a P&L was uploaded), explicitly say so in your finding — e.g. "YoY comparison not possible with a single month's P&L. To enable this, ask your bookkeeper to provide the same period from last year." Do NOT fabricate numbers or comparisons you cannot support from the data.
- If no data is uploaded at all, base your analysis on industry benchmarks for a ${req.companyContext.industry} company in South Africa targeting R100m/y revenue, and clearly label insights as benchmark-based.`;

  const hasJimGeneral = req.additionalFocus.includes('[JIM_GENERAL]');

  const advisoryInstructions = isAdvisory
    ? `\n\nAdvisory Mode Instructions:
- Act as if the founder just asked: "I've hired you as our CFO. Here's what we have. What should I focus on?"
- Prioritise ruthlessly — what are the 3-5 things that matter most RIGHT NOW for a business at this stage?
- Be honest about what's missing from their data and what they should be asking their bookkeeper for
- Think about: cash runway, unit economics, gross margin trajectory, cost discipline, and scaling readiness
- Don't just analyze — advise. Tell them what to DO.`
    : '';

  const jimGeneralInstructions = hasJimGeneral && !isAdvisory
    ? `\n\nJim's Overall Assessment Mode:
- In ADDITION to the specific focus areas, include a holistic big-picture CFO section as the FIRST item in detailedAnalysis titled "Jim's Overall Take"
- In that section: step back and tell the founder what a seasoned CFO would notice first — the 2-3 things that matter most right now
- Be direct and practical: what's working, what's not, what needs immediate attention
- Prioritise — don't just list everything, tell them what to focus on THIS month
- If something is missing from the data, say so (e.g. "I can't see your cash position — ask your bookkeeper for a cash flow statement")`
    : '';

  return `${roleDescription}

## Company Context
- Company: ${req.companyContext.companyName}${isCombined ? ' (Tech Revival + ReCommerce SA — consolidated group view)' : ''}
- Industry: ${req.companyContext.industry}
- Primary Goal: ${req.companyContext.primaryGoal}
- Geography: ${req.companyContext.targetGeography}
${req.companyContext.additionalContext ? `- Additional Context: ${req.companyContext.additionalContext}` : ''}${entityNote}

## Analysis Type
- Function: ${req.functionName}
- Category: ${req.category}

## Focus Areas
${focusList}
${req.additionalFocus ? `\nAdditional focus: ${req.additionalFocus.replace(/\[JIM_GENERAL\]\s*/g, '').trim()}` : ''}

## Financial Data Provided
${req.uploadedData || 'No specific data uploaded — provide analysis based on the company context and industry benchmarks. Clearly label all insights as benchmark-based.'}

## Data Interpretation Notes
- Data is in pipe-delimited format. Each file section starts with "--- File: ..." and may include an [Entity: ...] tag.
- Rows marked with **bold** labels are totals/subtotals computed from line items above them.
- All monetary values are in ZAR (South African Rand) unless stated otherwise.
- Multiple files may represent different entities, time periods, or statement types (P&L, Balance Sheet).
- CRITICAL: Use the ACTUAL numbers in the data. Do not say "data not available" if numbers are present — read the pipe-delimited rows carefully.${advisoryInstructions}${jimGeneralInstructions}

## Output Style
- Executive summary: 2-3 sentences MAX. No filler. Start with the most important finding.
- Key findings: 1 short sentence each. Bold the key number.
- Detailed analysis: Max 3-4 sentences per section. Bold key numbers and percentages. Be scannable, not academic.
- Recommendations: 1-2 sentences each. Lead with the action verb.
- Action items: 1 sentence title, 1 sentence description.
- Every sentence must contain a specific insight or number. No generic padding.

## Instructions
Analyze the provided financial data and return a JSON object with this exact structure:

{
  "executiveSummary": "2-3 sentences ONLY. ${isAdvisory ? 'Speak directly to the founder — what matters most right now and what should they do first?' : 'Lead with the single most important insight. Include specific numbers. No filler.'}",
  "healthScore": <number 0-100>,
  "healthStatus": "<red|amber|green>",
  "keyFindings": [
    {
      "icon": "<relevant emoji>",
      "title": "<short finding title>",
      "description": "<1-2 sentence description with specific numbers if available, or honest statement about missing data>"
    }
  ],
  "detailedAnalysis": [
    {
      "title": "<section title>",
      "content": "<detailed analysis paragraph>",
      "chart": {
        "type": "<bar|line|pie>",
        "data": [<array of data objects appropriate for the chart type>]
      }
    }
  ],
  "recommendations": [
    {
      "id": "<sequential number as string>",
      "title": "<recommendation title>",
      "description": "<specific actionable recommendation>",
      "priority": "<critical|high|medium|low>"
    }
  ],
  "actionItems": [
    {
      "id": "<sequential number as string>",
      "title": "<task title>",
      "description": "<task description>",
      "priority": "<critical|high|medium|low>",
      "estimatedEffort": "<low|medium|high>",
      "suggestedDueDate": "<YYYY-MM-DD format, within next 30-90 days>"
    }
  ],
  "bookkeeperFeedback": {
    "reportQuality": "<good|adequate|needs-improvement>",
    "feedback": "<2-3 sentences of constructive feedback on the bookkeeper's reporting quality, completeness, and presentation. ${isAdvisory ? 'Be specific about what reports/data you would need as CFO that are currently missing.' : ''}>",
    "trainingNotes": [
      "<specific training suggestion or improvement area for the bookkeeper>"
    ]
  }
}

Important rules:
- Provide 4-6 key findings
- Provide 3-4 detailed analysis sections, each with a relevant chart
- For bar charts, use objects with a "name" key and numeric value keys
- For line charts, use objects with a "month" or "period" key and numeric value keys
- For pie charts, use objects with "name" and "value" keys
- Provide 4-6 recommendations ordered by priority
- Provide 3-5 action items with realistic due dates
- All monetary values should use ZAR (South African Rand)
- Be specific, data-driven, and actionable${dataAwarenessRule}
- If bookkeeper notes or email content is included, provide constructive feedback on the reporting quality and specific training recommendations. If no bookkeeper content is present, still provide bookkeeperFeedback about what data/reports you'd want to see as their CFO.`;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Anthropic API key not configured. Add ANTHROPIC_API_KEY to your .env file.' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const prompt = buildCFOPrompt(body);

    // Debug logging
    console.log(`[analyze] uploadedData length: ${body.uploadedData?.length || 0} chars`);
    console.log(`[analyze] focusAreas: ${body.focusAreas?.join(', ') || 'none'}`);
    console.log(`[analyze] prompt length: ${prompt.length} chars`);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Check if response was truncated
    if (message.stop_reason === 'max_tokens') {
      throw new Error('Analysis response was truncated. Please select fewer focus areas and try again.');
    }

    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse the JSON response — robust extraction handles code fences, surrounding text, etc.
    let jsonText = textContent.text.trim();

    // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
    // Use greedy match to capture the full content between fences
    const fenceMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*)\n?\s*```/);
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim();
    }

    // If it still doesn't start with {, extract the outermost JSON object
    if (!jsonText.startsWith('{')) {
      const braceStart = jsonText.indexOf('{');
      const braceEnd = jsonText.lastIndexOf('}');
      if (braceStart !== -1 && braceEnd > braceStart) {
        jsonText = jsonText.substring(braceStart, braceEnd + 1);
      }
    }

    const analysis = JSON.parse(jsonText);

    return NextResponse.json({ success: true, analysis }, { status: 200 });
  } catch (error: any) {
    console.error('Analysis error:', error?.message || error);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to run analysis' },
      { status: 500 }
    );
  }
}
