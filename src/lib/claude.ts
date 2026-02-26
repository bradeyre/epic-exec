import Anthropic from '@anthropic-ai/sdk';
import { AnalysisResult } from '@/types';

// Model selection based on V3 §5.1
type ModelTier = 'fast' | 'standard' | 'deep';

const MODEL_MAP: Record<ModelTier, string> = {
  fast: 'claude-haiku-4-5-20251001', // proactive alerts, simple patterns
  standard: 'claude-sonnet-4-5-20250929', // standard analyses, chat, content
  deep: 'claude-opus-4-5-20251101', // complex analysis, brand voice onboarding
};

let clientInstance: Anthropic | null = null;

/**
 * Get or create the Anthropic API client (singleton)
 */
export function getClient(): Anthropic {
  if (!clientInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    clientInstance = new Anthropic({ apiKey });
  }
  return clientInstance;
}

interface AnalysisParams {
  systemPrompt: string;
  userPrompt: string;
  model?: ModelTier;
  stream?: boolean;
}

interface AnalysisResponse {
  content: string;
  metadata: {
    processingTimeMs: number;
    tokenCount: number;
    costEstimate: number;
    modelUsed: string;
  };
}

/**
 * Run an analysis with Claude, optionally with streaming support
 */
export async function runAnalysis(params: AnalysisParams): Promise<AnalysisResponse> {
  const { systemPrompt, userPrompt, model = 'standard', stream = false } = params;
  const client = getClient();
  const modelId = MODEL_MAP[model];

  const startTime = Date.now();

  try {
    const response = await client.messages.create({
      model: modelId,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      stream: stream as false,
    });

    // Handle non-streaming response
    if (!stream) {
      const textBlock = (response as any).content.find((block: any) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text content in response');
      }

      const processingTimeMs = Date.now() - startTime;
      const tokenCount = ((response as any).usage.input_tokens || 0) + ((response as any).usage.output_tokens || 0);
      const costEstimate = calculateTokenCost(modelId, (response as any).usage);

      return {
        content: textBlock.text,
        metadata: {
          processingTimeMs,
          tokenCount,
          costEstimate,
          modelUsed: modelId,
        },
      };
    }

    // Note: Streaming should be handled by the caller
    throw new Error('Streaming must be handled by the caller');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
    throw error;
  }
}

interface ContentGenerationParams {
  systemPrompt: string;
  userPrompt: string;
  brandVoice?: string;
  model?: ModelTier;
}

/**
 * Generate content (newsletter, social media, etc.) with optional brand voice customization
 */
export async function generateContent(params: ContentGenerationParams): Promise<AnalysisResponse> {
  const { systemPrompt, userPrompt, brandVoice, model = 'standard' } = params;

  const finalSystemPrompt = brandVoice
    ? `${systemPrompt}\n\nBrand Voice Guidelines:\n${brandVoice}`
    : systemPrompt;

  return runAnalysis({
    systemPrompt: finalSystemPrompt,
    userPrompt,
    model,
  });
}

interface ImageExtractionParams {
  imageBase64: string;
  context: string;
}

/**
 * Extract structured data from an image using Claude's vision capabilities
 */
export async function extractDataFromImage(params: ImageExtractionParams): Promise<any> {
  const { imageBase64, context } = params;
  const client = getClient();

  try {
    const response = await client.messages.create({
      model: MODEL_MAP.standard,
      max_tokens: 2048,
      system: `You are an expert data extraction system. Extract structured data from images with high accuracy.
Context: ${context}
Return data as valid JSON. Be precise and complete.`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Extract all structured data from this image and return as JSON.',
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Try to parse JSON response
    try {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If JSON parsing fails, return the raw text
      return { text: textBlock.text };
    }

    return { text: textBlock.text };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Image extraction failed: ${error.message}`);
    }
    throw error;
  }
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatParams {
  messages: ChatMessage[];
  companyContext: string;
  model?: ModelTier;
}

/**
 * Conversational chat with Claude, with company context awareness
 */
export async function chat(params: ChatParams): Promise<AnalysisResponse> {
  const { messages, companyContext, model = 'standard' } = params;
  const client = getClient();
  const modelId = MODEL_MAP[model];

  const startTime = Date.now();

  const systemPrompt = `You are an expert virtual executive assistant for a company with the following context:
${companyContext}

You provide strategic insights, actionable recommendations, and thoughtful analysis. Be concise yet comprehensive.`;

  try {
    const response = await client.messages.create({
      model: modelId,
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in response');
    }

    const processingTimeMs = Date.now() - startTime;
    const tokenCount = (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0);
    const costEstimate = calculateTokenCost(modelId, response.usage);

    return {
      content: textBlock.text,
      metadata: {
        processingTimeMs,
        tokenCount,
        costEstimate,
        modelUsed: modelId,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Chat failed: ${error.message}`);
    }
    throw error;
  }
}

interface BrandVoiceAnalysisParams {
  content: string[];
  model?: ModelTier;
}

/**
 * Analyze content samples to extract and define brand voice characteristics
 */
export async function analyzeBrandVoice(
  params: BrandVoiceAnalysisParams,
): Promise<Record<string, any>> {
  const { content, model = 'deep' } = params;

  const prompt = `Analyze the following content samples and extract the brand voice characteristics:

${content.map((c, i) => `Sample ${i + 1}:\n${c}`).join('\n\n')}

Provide a detailed analysis including:
- Tone and personality
- Formality level (0-100)
- Humor frequency (0-100)
- Emoji usage (none/minimal/moderate/frequent)
- Preferred vocabulary and phrases
- Sentence structure style
- Call-to-action style
- Audience relationship
- Content pillars
- Visual tone recommendations

Return as JSON with these exact keys.`;

  try {
    const result = await runAnalysis({
      systemPrompt: `You are an expert brand analyst specializing in voice and tone analysis. Extract detailed brand voice characteristics from content samples. Return valid JSON only, no markdown formatting.`,
      userPrompt: prompt,
      model,
    });

    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      return { raw: result.content };
    }

    return { raw: result.content };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Brand voice analysis failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Calculate estimated cost based on token usage and model
 */
function calculateTokenCost(
  modelId: string,
  usage: { input_tokens?: number; output_tokens?: number },
): number {
  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;

  // Pricing per 1M tokens (as of Feb 2025)
  const pricingMap: Record<string, { input: number; output: number }> = {
    'claude-haiku-4-5-20251001': {
      input: 0.8, // $0.80 per 1M input tokens
      output: 4.0, // $4.00 per 1M output tokens
    },
    'claude-sonnet-4-5-20250929': {
      input: 3.0, // $3.00 per 1M input tokens
      output: 15.0, // $15.00 per 1M output tokens
    },
    'claude-opus-4-5-20251101': {
      input: 15.0, // $15.00 per 1M input tokens
      output: 75.0, // $75.00 per 1M output tokens
    },
  };

  const pricing = pricingMap[modelId] || pricingMap['claude-sonnet-4-5-20250929'];

  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}

/**
 * Create a streaming handler for real-time analysis responses
 */
export async function* runAnalysisStream(params: AnalysisParams): AsyncGenerator<string> {
  const { systemPrompt, userPrompt, model = 'standard' } = params;
  const client = getClient();
  const modelId = MODEL_MAP[model];

  try {
    const stream = await client.messages.stream({
      model: modelId,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta' &&
        chunk.delta.text
      ) {
        yield chunk.delta.text;
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Streaming analysis failed: ${error.message}`);
    }
    throw error;
  }
}
