import { NextRequest, NextResponse } from 'next/server';

// Mock prompts data
const MOCK_PROMPTS = [
  {
    id: '1',
    title: 'Cash Flow Analysis',
    module: 'CFO',
    functionId: 'cash_flow_analysis',
    currentVersion: '3',
    status: 'ACTIVE',
    systemPrompt: `You are a financial analysis expert specializing in cash flow management.
Analyze the provided financial data and generate actionable recommendations.

Focus on:
- Cash position trends and forecasting
- Working capital optimization
- Liquidity risks and mitigation strategies
- Cash runway projections

Provide analysis in a professional, executive-friendly format with clear metrics and actionable recommendations.`,
    userPromptTemplate: `Analyze the cash flow for {{company_name}} for {{period}}.

Data points:
{{data_points}}

Target metrics:
{{target_metrics}}

Provide a comprehensive analysis including:
1. Current cash position and trends
2. Working capital assessment
3. Cash runway forecast
4. Key risks and recommendations`,
    variables: [
      { name: 'company_name', type: 'string', description: 'Name of the company', required: true },
      { name: 'period', type: 'string', description: 'Analysis period', required: true },
      { name: 'data_points', type: 'json', description: 'Historical financial data', required: true },
      { name: 'target_metrics', type: 'json', description: 'Target values', required: false },
    ],
    usageCount: 1240,
    satisfaction: 4.8,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(Date.now() - 432000000),
  },
  {
    id: '2',
    title: 'Campaign Performance',
    module: 'CMO',
    functionId: 'campaign_performance',
    currentVersion: '2',
    status: 'ACTIVE',
    systemPrompt: `You are a marketing analytics expert. Analyze campaign performance data
and provide strategic recommendations for optimization.`,
    userPromptTemplate: `Analyze the marketing campaign performance for {{company_name}}.

Campaign Data:
{{campaign_data}}

Provide analysis on:
1. ROI and ROAS metrics
2. Channel performance comparison
3. Audience segment insights
4. Optimization recommendations`,
    variables: [
      { name: 'company_name', type: 'string', description: 'Company name', required: true },
      { name: 'campaign_data', type: 'json', description: 'Campaign metrics', required: true },
    ],
    usageCount: 856,
    satisfaction: 4.6,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date(Date.now() - 604800000),
  },
  {
    id: '3',
    title: 'Revenue Forecast',
    module: 'CFO',
    functionId: 'revenue_forecast',
    currentVersion: '4',
    status: 'ACTIVE',
    systemPrompt: `You are a financial forecasting expert. Create accurate revenue projections
based on historical data and market trends.`,
    userPromptTemplate: `Create a revenue forecast for {{company_name}} for {{forecast_period}}.

Historical Data:
{{historical_revenue}}

Market Factors:
{{market_factors}}

Provide:
1. Revenue projection with confidence intervals
2. Key growth drivers
3. Risk factors and mitigation
4. Scenario analysis (best/base/worst case)`,
    variables: [
      { name: 'company_name', type: 'string', description: 'Company name', required: true },
      { name: 'forecast_period', type: 'string', description: 'Forecast timeframe', required: true },
      { name: 'historical_revenue', type: 'json', description: 'Revenue data', required: true },
      { name: 'market_factors', type: 'json', description: 'Market conditions', required: false },
    ],
    usageCount: 1050,
    satisfaction: 4.7,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(Date.now() - 259200000),
  },
];

/**
 * GET /api/prompts
 * List all prompts (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const module = searchParams.get('module');
    const status = searchParams.get('status');

    // In production, check admin authorization
    // if (!isAdmin(request)) return 403

    let filtered = MOCK_PROMPTS;

    if (module) {
      filtered = filtered.filter((p) => p.module === module);
    }

    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    return NextResponse.json(
      {
        success: true,
        prompts: filtered,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prompts',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prompts
 * Create a new prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      module,
      functionId,
      systemPrompt,
      userPromptTemplate,
      variables,
    } = body;

    // Validate required fields
    if (!title || !module || !functionId || !systemPrompt || !userPromptTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // In production, check admin authorization
    const newPrompt = {
      id: `prompt-${Date.now()}`,
      title,
      module,
      functionId,
      currentVersion: '1',
      status: 'DRAFT',
      systemPrompt,
      userPromptTemplate,
      variables: variables || [],
      usageCount: 0,
      satisfaction: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        prompt: newPrompt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create prompt',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/prompts
 * Update prompt or create new version
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, systemPrompt, userPromptTemplate, createNewVersion } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: id',
        },
        { status: 400 }
      );
    }

    // Find prompt
    const prompt = MOCK_PROMPTS.find((p) => p.id === id);
    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt not found',
        },
        { status: 404 }
      );
    }

    if (createNewVersion) {
      // In production, create version record
      const versionNum = parseInt(prompt.currentVersion) + 1;
      prompt.currentVersion = versionNum.toString();
      prompt.status = 'DRAFT';
    }

    if (systemPrompt) prompt.systemPrompt = systemPrompt;
    if (userPromptTemplate) prompt.userPromptTemplate = userPromptTemplate;
    prompt.updatedAt = new Date();

    return NextResponse.json(
      {
        success: true,
        prompt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update prompt',
      },
      { status: 500 }
    );
  }
}
