import { NextRequest, NextResponse } from 'next/server';

// Mock financial data points
const FINANCIAL_DATA_POINTS = [
  { month: 'Jan', revenue: 185000, margin: 58.2, opex: 42.1, cash: 220000 },
  { month: 'Feb', revenue: 192000, margin: 59.1, opex: 41.8, cash: 235000 },
  { month: 'Mar', revenue: 198500, margin: 59.8, opex: 41.5, cash: 255000 },
  { month: 'Apr', revenue: 205000, margin: 60.2, opex: 41.2, cash: 270000 },
  { month: 'May', revenue: 198000, margin: 59.5, opex: 41.8, cash: 275000 },
  { month: 'Jun', revenue: 210000, margin: 60.5, opex: 40.9, cash: 285000 },
  { month: 'Jul', revenue: 215000, margin: 60.8, opex: 40.6, cash: 295000 },
  { month: 'Aug', revenue: 208000, margin: 60.1, opex: 41.1, cash: 305000 },
  { month: 'Sep', revenue: 220000, margin: 61.2, opex: 40.3, cash: 315000 },
  { month: 'Oct', revenue: 225000, margin: 61.5, opex: 40.0, cash: 325000 },
  { month: 'Nov', revenue: 235000, margin: 62.1, opex: 39.8, cash: 340000 },
  { month: 'Dec', revenue: 245000, margin: 62.8, opex: 39.5, cash: 360000 },
];

// Mock marketing data points
const MARKETING_DATA_POINTS = [
  { month: 'Jan', spend: 35000, revenue: 185000, roas: 5.3 },
  { month: 'Feb', spend: 38000, revenue: 192000, roas: 5.05 },
  { month: 'Mar', spend: 42000, revenue: 198500, roas: 4.73 },
  { month: 'Apr', spend: 45000, revenue: 205000, roas: 4.56 },
  { month: 'May', spend: 40000, revenue: 198000, roas: 4.95 },
  { month: 'Jun', spend: 48000, revenue: 210000, roas: 4.38 },
  { month: 'Jul', spend: 50000, revenue: 215000, roas: 4.3 },
  { month: 'Aug', spend: 46000, revenue: 208000, roas: 4.52 },
  { month: 'Sep', spend: 52000, revenue: 220000, roas: 4.23 },
  { month: 'Oct', spend: 55000, revenue: 225000, roas: 4.09 },
  { month: 'Nov', spend: 58000, revenue: 235000, roas: 4.05 },
  { month: 'Dec', spend: 62000, revenue: 245000, roas: 3.95 },
];

/**
 * GET /api/tracking
 * Retrieve historical metrics for dashboards (financial/marketing data points)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const type = searchParams.get('type'); // 'financial' | 'marketing' | 'both'
    const period = searchParams.get('period'); // '6m' | '12m' | '24m'

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: companyId',
        },
        { status: 400 }
      );
    }

    const requestedType = type || 'both';
    const requestedPeriod = period || '12m';

    // Filter data based on period
    let financialData = FINANCIAL_DATA_POINTS;
    let marketingData = MARKETING_DATA_POINTS;

    if (requestedPeriod === '6m') {
      financialData = financialData.slice(-6);
      marketingData = marketingData.slice(-6);
    } else if (requestedPeriod === '24m') {
      // In production, fetch more months from database
      financialData = financialData.slice(-12); // Mock 24m with doubled data
      marketingData = marketingData.slice(-12);
    }

    const response: {
      success: boolean;
      data?: { financial?: typeof financialData; marketing?: typeof marketingData };
      summary?: {
        financial: {
          currentRevenue: number;
          revenueGrowth: number;
          currentMargin: number;
          marginTrend: number;
        };
        marketing: {
          currentSpend: number;
          currentROAS: number;
          ROASTrend: number;
        };
      };
      error?: string;
    } = {
      success: true,
      data: {},
    };

    if (requestedType === 'financial' || requestedType === 'both') {
      response.data!.financial = financialData;
    }

    if (requestedType === 'marketing' || requestedType === 'both') {
      response.data!.marketing = marketingData;
    }

    // Add summary statistics
    if (financialData.length > 0 && marketingData.length > 0) {
      const lastFinancial = financialData[financialData.length - 1];
      const firstFinancial = financialData[0];
      const lastMarketing = marketingData[marketingData.length - 1];
      const firstMarketing = marketingData[0];

      response.summary = {
        financial: {
          currentRevenue: lastFinancial.revenue,
          revenueGrowth:
            ((lastFinancial.revenue - firstFinancial.revenue) /
              firstFinancial.revenue) *
            100,
          currentMargin: lastFinancial.margin,
          marginTrend: lastFinancial.margin - firstFinancial.margin,
        },
        marketing: {
          currentSpend: lastMarketing.spend,
          currentROAS: lastMarketing.roas,
          ROASTrend: lastMarketing.roas - firstMarketing.roas,
        },
      };
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tracking data',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tracking
 * Record custom tracking data points
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, type, data } = body;

    if (!companyId || !type || !data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: companyId, type, data',
        },
        { status: 400 }
      );
    }

    // In production, validate type is 'financial' or 'marketing'
    // and save to database

    const dataPoint = {
      id: `dp-${Date.now()}`,
      companyId,
      type,
      data,
      recordedAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        dataPoint,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording tracking data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record tracking data',
      },
      { status: 500 }
    );
  }
}
