import { db } from '@/lib/db';
import { Module, ModuleFunctionId } from '@/types';

/**
 * Get the currently active prompt version for a module function
 */
export async function getActivePrompt(
  module: Module,
  functionName: string,
  tenantId: string,
): Promise<string | null> {
  const prompt = await db.prompt.findUnique({
    where: {
      tenantId_module_functionName: {
        tenantId,
        module,
        functionName,
      },
    },
    include: {
      versions: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!prompt || !prompt.versions.length) {
    return getDefaultPrompt(module, functionName);
  }

  return prompt.versions[0].systemPrompt;
}

/**
 * Build a prompt from a template by replacing {{variable}} placeholders
 */
export function buildPrompt(template: string, variables: Record<string, any>): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    const stringValue =
      typeof value === 'string' ? value : typeof value === 'object' ? JSON.stringify(value) : String(value);
    result = result.replace(new RegExp(placeholder, 'g'), stringValue);
  }

  return result;
}

interface AnalysisPromptParams {
  functionName: string;
  companyContext: string;
  data: Record<string, any>;
  focusAreas?: string[];
}

/**
 * Build a complete analysis prompt with all context and data
 */
export function buildAnalysisPrompt(params: AnalysisPromptParams): string {
  const { functionName, companyContext, data, focusAreas = [] } = params;

  const focusAreasSection =
    focusAreas.length > 0
      ? `\n\nFocus Areas:\n${focusAreas.map((area) => `- ${area}`).join('\n')}`
      : '';

  const dataSection = `\n\nData Provided:\n${JSON.stringify(data, null, 2)}`;

  return `Company Context:\n${companyContext}${focusAreasSection}${dataSection}`;
}

/**
 * Get default system prompt for CMO module
 */
function getCMOSystemPrompt(): string {
  return `You are an expert Chief Marketing Officer (CMO) AI advisor. You analyze marketing data, brand positioning, content strategies, campaign performance, and customer engagement metrics.

Your role is to:
- Provide strategic insights grounded in data
- Identify actionable opportunities for improvement
- Benchmark against industry standards
- Consider audience psychology and market trends
- Recommend specific, implementable actions
- Think creatively about marketing positioning and messaging
- Evaluate brand health holistically

Always structure your analysis with:
1. Executive Summary (2-3 sentences)
2. Key Findings (3-5 specific, data-backed observations)
3. Strategic Recommendations (3-5 actionable items)
4. Quick Wins (1-2 immediate actions)
5. 90-Day Roadmap (phased approach)

Be direct, insightful, and focused on business impact.`;
}

/**
 * Get default system prompt for CFO module
 */
function getCFOSystemPrompt(): string {
  return `You are an expert Chief Financial Officer (CFO) AI advisor. You analyze financial statements, cash flow, budgets, profitability, and financial health.

Your role is to:
- Identify financial trends and anomalies
- Assess liquidity, solvency, and profitability
- Recommend cost optimization and revenue enhancement opportunities
- Evaluate financial risks and mitigation strategies
- Provide actionable financial insights
- Consider both short-term cash flow and long-term financial health

Always structure your analysis with:
1. Executive Summary (2-3 sentences)
2. Financial Health Assessment (RED/AMBER/GREEN with rationale)
3. Key Findings (3-5 specific observations with metrics)
4. Risk Assessment (potential financial challenges)
5. Strategic Recommendations (3-5 prioritized actions)
6. Quick Wins (1-2 immediate cost-saving or revenue opportunities)
7. 90-Day Action Plan (phased implementation)

Be precise, data-driven, and focused on financial sustainability and growth.`;
}

/**
 * Google Ads Audit Prompt Template (V1 §17.1)
 */
const GOOGLE_ADS_AUDIT_TEMPLATE = `You are a Google Ads expert auditing an account with the following characteristics:

Company: {{companyName}}
Industry: {{industry}}
Monthly Ad Spend: {{monthlySpend}}
Current ROAS: {{currentROAS}}
Campaign Type(s): {{campaignTypes}}

Data Provided:
{{accountData}}

Analyze the following aspects:

1. **Account Structure & Organization**
   - Campaign organization and naming conventions
   - Ad group structure and relevance
   - Quality Score assessment
   - Account settings alignment with goals

2. **Keyword Strategy**
   - Keyword relevance to ad groups
   - Match type distribution
   - Search term to keyword mapping
   - Negative keyword coverage
   - Keyword bid strategy alignment

3. **Ad Quality & Messaging**
   - Ad headline/copy effectiveness
   - Call-to-action clarity
   - Ad relevance to keywords
   - Landing page experience assessment
   - A/B testing status

4. **Bidding & Budget**
   - Bid strategy appropriateness
   - Budget allocation efficiency
   - Cost-per-acquisition trends
   - Bid management automation

5. **Performance Metrics**
   - Click-through rate benchmarking
   - Conversion rate analysis
   - Return on ad spend (ROAS) drivers
   - Cost trends and efficiency

6. **Extensions & Features**
   - Sitelink extension usage
   - Callout extensions
   - Structured snippets
   - Call extensions deployment

Provide specific, actionable findings and prioritized recommendations to improve performance.`;

/**
 * P&L Analysis Prompt Template (V1 §17.2)
 */
const PL_ANALYSIS_TEMPLATE = `You are a financial analyst providing a comprehensive P&L (Profit & Loss) analysis for:

Company: {{companyName}}
Industry: {{industry}}
Period: {{period}}
Currency: {{currency}}

Financial Data:
{{financialData}}

Conduct a thorough analysis covering:

1. **Revenue Analysis**
   - Revenue trends (YoY and sequential)
   - Revenue mix by product/service line
   - Growth rate analysis
   - Revenue seasonality patterns
   - Pricing power assessment

2. **Cost of Goods Sold (COGS) Analysis**
   - COGS as percentage of revenue
   - COGS trend analysis
   - Gross margin trends
   - Cost efficiency improvements
   - Raw material and labor cost impacts

3. **Operating Expenses**
   - Expense category breakdown (Sales, Marketing, R&D, G&A)
   - Expense ratio analysis (% of revenue)
   - Expense trends and variance
   - Fixed vs. variable cost split
   - Overhead efficiency

4. **Operating Income**
   - Operating margin analysis
   - EBITDA trends
   - Operating leverage assessment
   - Profitability by business segment

5. **Below-the-Line Items**
   - Interest expense trends
   - Tax rate analysis
   - Non-operating item impact
   - Net profit margin analysis

6. **Comparative Analysis**
   - Peer/industry benchmarking
   - Performance vs. targets/budget
   - Performance vs. prior periods

7. **Key Metrics & Ratios**
   - Gross margin
   - Operating margin
   - Net profit margin
   - Burn rate (if applicable)
   - Unit economics

Provide clear identification of:
- **Strengths**: Areas of strong performance
- **Concerns**: Areas requiring attention
- **Opportunities**: Specific levers for improvement
- **Action Items**: Prioritized next steps

Format findings with specific numbers and percentages. Be direct about areas of concern.`;

/**
 * Brand Audit Prompt Template
 */
const BRAND_AUDIT_TEMPLATE = `You are a brand strategist conducting a comprehensive brand audit.

Company: {{companyName}}
Industry: {{industry}}
Target Audience: {{targetAudience}}

Brand Assets Provided:
- Website: {{websiteUrl}}
- Social Media: {{socialMediaAccounts}}
- Brand Guidelines: {{brandGuidelines}}
- Market Materials: {{materials}}

Analyze:

1. **Brand Identity**
   - Logo design and application
   - Color palette consistency
   - Typography usage
   - Visual consistency across channels

2. **Brand Positioning**
   - Current market position
   - Unique value proposition clarity
   - Differentiation vs. competitors
   - Messaging consistency

3. **Brand Perception**
   - Customer perception analysis
   - Brand awareness assessment
   - Brand sentiment from available data
   - Reputation strengths/weaknesses

4. **Brand Voice & Tone**
   - Messaging consistency
   - Tone appropriateness for audience
   - Voice distinctiveness
   - Communication style

5. **Customer Experience**
   - Brand touchpoint analysis
   - Customer journey mapping
   - Experience consistency
   - Pain points in interactions

6. **Competitive Positioning**
   - Competitor brand analysis
   - Market positioning gaps
   - Differentiation opportunities
   - Competitive advantages

7. **Digital Presence**
   - Website effectiveness
   - Social media presence
   - Digital consistency
   - SEO/discoverability

Provide:
- Brand health score (0-100)
- Key strengths
- Areas for improvement
- Specific brand refresh recommendations
- 6-month brand development roadmap`;

/**
 * Get default prompt for a module and function
 */
export function getDefaultPrompt(module: Module, functionName: string): string {
  if (module === 'CMO') {
    return getCMOSystemPrompt();
  }

  if (module === 'CFO') {
    return getCFOSystemPrompt();
  }

  return `You are an expert advisor analyzing {{functionName}} for {{companyName}}.
Provide data-driven insights, identify key findings, and recommend specific actions.
Structure your response with executive summary, findings, and recommendations.`;
}

/**
 * Get specific prompt templates for detailed analyses
 */
export function getAnalysisTemplate(functionName: string): string {
  const templates: Record<string, string> = {
    google_ads_audit: GOOGLE_ADS_AUDIT_TEMPLATE,
    pl_analysis: PL_ANALYSIS_TEMPLATE,
    brand_audit: BRAND_AUDIT_TEMPLATE,
    campaign_performance: `Analyze the performance of {{campaignName}} campaign:

Data: {{campaignData}}

Evaluate:
1. Campaign objectives achievement
2. ROI and efficiency metrics
3. Audience engagement
4. Channel performance
5. Conversion funnel analysis
6. Attribution and impact
7. Optimization opportunities
8. Competitive benchmarking

Provide specific metrics, trends, and actionable recommendations.`,
    cash_flow_analysis: `Analyze cash flow for {{companyName}}:

Cash Flow Data: {{cashFlowData}}
Period: {{period}}

Assess:
1. Operating cash flow trends
2. Investing cash flow patterns
3. Financing cash flow assessment
4. Cash position and runway
5. Working capital efficiency
6. Cash conversion cycle
7. Liquidity risks
8. Cash improvement opportunities

Provide specific findings and recommendations.`,
    content_strategy: `Develop content strategy for {{companyName}}:

Current Situation:
- Industry: {{industry}}
- Target Audience: {{audience}}
- Existing Content: {{existingContent}}
- Goals: {{goals}}

Recommend:
1. Content pillars (3-5 core topics)
2. Content types and formats
3. Publishing cadence
4. Channel strategy
5. SEO strategy
6. Measurement framework
7. Resource requirements
8. 6-month roadmap`,
  };

  return templates[functionName] || templates['brand_audit'];
}

/**
 * Format a complete analysis prompt with system and user messages
 */
export interface FormattedPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export function formatAnalysisPrompt(
  module: Module,
  functionName: string,
  params: {
    companyName: string;
    companyContext: string;
    data: Record<string, any>;
    customVariables?: Record<string, any>;
  },
): FormattedPrompt {
  const { companyName, companyContext, data, customVariables = {} } = params;

  const systemPrompt = getDefaultPrompt(module, functionName);
  const template = getAnalysisTemplate(functionName);

  const variables = {
    companyName,
    ...data,
    ...customVariables,
  };

  const userPrompt = buildPrompt(template, variables);

  return {
    systemPrompt,
    userPrompt,
  };
}
