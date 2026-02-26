import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { saveGoal, getGoals, addGoalProgress, buildMemoryContext } from '@/lib/memory';

// ---------------------------------------------------------------------------
// API key helper
// ---------------------------------------------------------------------------

function getApiKey(): string {
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.length > 10) {
    return process.env.ANTHROPIC_API_KEY;
  }
  try {
    const envPath = join(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
  try {
    const envPath = join(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) return match[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
  return '';
}

// ---------------------------------------------------------------------------
// GET /api/goals — List goals for a company
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: companyId' },
        { status: 400 },
      );
    }

    const goals = await getGoals(companyId);
    return NextResponse.json({ success: true, goals }, { status: 200 });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goals' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/goals — Create a goal and get Jim's breakdown
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, title, target, deadline, askJim } = body;

    if (!companyId || !title || !target || !deadline) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: companyId, title, target, deadline' },
        { status: 400 },
      );
    }

    let breakdown: Record<string, unknown> | undefined;

    // If askJim is true, get Jim's analysis of the goal
    if (askJim) {
      const apiKey = getApiKey();
      if (apiKey) {
        try {
          const memoryContext = await buildMemoryContext(companyId);
          const client = new Anthropic({ apiKey });

          const response = await client.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 4096,
            system: `You are Jim, a Virtual CFO advisor for a South African business. You help break down business goals into actionable plans.

${memoryContext}

Respond in JSON format only. No markdown, no code fences.`,
            messages: [
              {
                role: 'user',
                content: `Break down this business goal into a practical plan:

Goal: ${title}
Target: ${target}
Deadline: ${deadline}

Return a JSON object with these exact keys:
{
  "summary": "1-2 sentence assessment of this goal's feasibility",
  "milestones": [
    { "month": "2026-03", "target": "description of what should be achieved", "metric": "specific measurable target" }
  ],
  "growthLevers": ["lever 1", "lever 2", "lever 3"],
  "keyRisks": ["risk 1", "risk 2", "risk 3"],
  "quickWins": ["action 1", "action 2"],
  "monthlyCheckpoints": "What to measure each month to stay on track"
}

Keep it practical, specific, and use ZAR currency where relevant. Limit to 4-6 milestones max.`,
              },
            ],
          });

          const text = response.content
            .filter((b) => b.type === 'text')
            .map((b) => (b.type === 'text' ? b.text : ''))
            .join('');

          // Parse JSON from response (handle potential markdown fences)
          const jsonStr = text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            breakdown = JSON.parse(jsonStr);
          } catch {
            // If JSON parse fails, store as raw text
            breakdown = { rawAnalysis: text };
          }
        } catch (err) {
          console.error('Jim analysis failed, saving goal without breakdown:', err);
        }
      }
    }

    const goal = await saveGoal({
      companyId,
      title,
      target,
      deadline: new Date(deadline),
      breakdown,
    });

    return NextResponse.json({ success: true, goal }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create goal' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/goals — Add progress check-in
// ---------------------------------------------------------------------------

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalId, month, actualData, jimFeedback, onTrack } = body;

    if (!goalId || !month) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: goalId, month' },
        { status: 400 },
      );
    }

    const progress = await addGoalProgress({
      goalId,
      month,
      actualData,
      jimFeedback,
      onTrack,
    });

    return NextResponse.json({ success: true, progress }, { status: 200 });
  } catch (error) {
    console.error('Error adding goal progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add goal progress' },
      { status: 500 },
    );
  }
}
