import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildMemoryContext, saveChatMessage, getChatMessages, addContextNote } from '@/lib/memory';

// ---------------------------------------------------------------------------
// API key helper (same pattern as /api/analyze)
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
// Jim's system prompt
// ---------------------------------------------------------------------------

function buildSystemPrompt(memoryContext: string): string {
  return `You are Jim, a Virtual Chief Financial Officer (CFO) and executive advisor. You work for Epic Exec, helping small and medium businesses in South Africa make smarter decisions with their data.

## Your Personality
- Direct, confident, and practical — like a trusted CFO who's been with the business for years
- You lead with the most important insight first
- You use specific numbers and percentages whenever possible
- You keep answers concise: 2-4 paragraphs max unless the user asks for detail
- You use South African Rand (ZAR / R) as default currency
- You occasionally reference previous analyses and tasks to show continuity

## Your Knowledge
You have access to the company's recent history below. Use it to give contextual, personalised advice. If you don't have data on something, say so honestly — never make up numbers.

${memoryContext}

## Response Guidelines
- Always lead with the direct answer, then provide context
- Use bullet points for lists of recommendations (max 4-5 items)
- When the user shares business context (e.g. "sales dropped because of stock issues"), acknowledge it and remember it
- If the user mentions something that would be useful context for future analyses, flag it with: [CONTEXT: brief note]
- Keep financial jargon accessible — explain terms if they might be unfamiliar
- End with a clear next step or question when appropriate`;
}

// ---------------------------------------------------------------------------
// Detect context notes in Jim's response
// ---------------------------------------------------------------------------

function extractContextNotes(response: string): string[] {
  const matches = response.match(/\[CONTEXT:\s*([^\]]+)\]/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/\[CONTEXT:\s*/, '').replace(/\]$/, '').trim());
}

// ---------------------------------------------------------------------------
// POST /api/chat — Send message to Jim
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, companyId } = body;

    if (!message || !companyId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: message, companyId' },
        { status: 400 },
      );
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Anthropic API key not configured' },
        { status: 500 },
      );
    }

    // 1. Save user message to database
    await saveChatMessage({ companyId, role: 'user', content: message });

    // 2. Build memory context (Jim's knowledge of this company)
    const memoryContext = await buildMemoryContext(companyId);

    // 3. Load recent chat history for conversation continuity
    const recentMessages = await getChatMessages(companyId, 20);
    const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = recentMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Ensure conversation ends with the current user message
    // (it should already be there since we just saved it, but be safe)
    if (conversationHistory.length === 0 || conversationHistory[conversationHistory.length - 1].content !== message) {
      conversationHistory.push({ role: 'user', content: message });
    }

    // 4. Call Claude API
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: buildSystemPrompt(memoryContext),
      messages: conversationHistory,
    });

    // Extract text from response
    const assistantContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => {
        if (block.type === 'text') return block.text;
        return '';
      })
      .join('\n');

    // 5. Save Jim's response to database
    await saveChatMessage({ companyId, role: 'assistant', content: assistantContent });

    // 6. Extract and save any context notes Jim flagged
    const contextNotes = extractContextNotes(assistantContent);
    for (const note of contextNotes) {
      await addContextNote({ companyId, note, source: 'chat' });
    }

    // 7. Return response
    return NextResponse.json(
      {
        success: true,
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: assistantContent,
          createdAt: new Date(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error processing chat message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to process chat message: ${errorMessage}` },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/chat — Retrieve chat history
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: companyId' },
        { status: 400 },
      );
    }

    const messages = await getChatMessages(companyId, 50);

    return NextResponse.json(
      {
        success: true,
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat history' },
      { status: 500 },
    );
  }
}
