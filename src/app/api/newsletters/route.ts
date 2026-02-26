import { NextRequest, NextResponse } from 'next/server';

// Mock newsletters data
const MOCK_NEWSLETTERS = [
  {
    id: '1',
    companyId: '1',
    title: 'Weekly Marketing Digest - Feb 10',
    status: 'SENT',
    subjectLines: [
      'Weekly Marketing & Finance Digest - Your Performance Snapshot',
      'February Performance Review - Revenue Up 4.2%',
      'Action Items: 3 Quick Wins to Boost Your Metrics',
    ],
    previewText: "This week's highlights: Google Ads ROAS increased to 3.85x, Revenue exceeded target by 4.2%",
    bodyContent: `Hello Brad,

Here's your weekly digest of key metrics and actionable insights:

**Revenue MTD:** R 156.3K (+4.2%)
**Gross Margin:** 62.8%
**Google Ads ROAS:** 3.85x (-2.1%)
**Active Tasks:** 24

Key recommendations for this week:
1. Review Google Ads bid strategy
2. Approve supplier contract review
3. Schedule content calendar planning

Best regards,
Virtual Executive AI`,
    contentSources: [
      { type: 'analysis', id: '1', title: 'Cash Flow Analysis' },
      { type: 'analysis', id: '2', title: 'Campaign Performance' },
      { type: 'metric', id: 'm1', title: 'Revenue MTD' },
    ],
    scheduledDate: new Date(Date.now() - 604800000),
    sentDate: new Date(Date.now() - 604800000),
    createdAt: new Date(Date.now() - 604800000),
    updatedAt: new Date(Date.now() - 604800000),
  },
  {
    id: '2',
    companyId: '1',
    title: 'February Financial Review',
    status: 'APPROVED',
    subjectLines: [
      'February Financial Summary - Strong Performance',
      'Monthly Review: Revenue Target Exceeded',
      'Q1 Financial Snapshot & Strategic Priorities',
    ],
    previewText: 'Revenue exceeded target by 4.2%. Gross margin improved to 62.8%...',
    bodyContent: `February Financial Review

Revenue: R 245K (+5.2% MoM)
Gross Margin: 62.8% (+1.8%)
Operating Expenses: 39.5% of revenue

Key Highlights:
- Strong revenue growth
- Improved profitability
- Cash position strengthened

Recommendations:
1. Maintain current pricing strategy
2. Continue supplier optimization
3. Expand into high-margin segments`,
    contentSources: [
      { type: 'analysis', id: '3', title: 'Margin Analysis' },
    ],
    scheduledDate: new Date(Date.now() + 259200000),
    sentDate: null,
    createdAt: new Date(Date.now() - 432000000),
    updatedAt: new Date(Date.now() - 432000000),
  },
  {
    id: '3',
    companyId: '1',
    title: 'Q1 Strategic Update',
    status: 'REVIEW',
    subjectLines: [
      'Q1 Strategic Review - Setting Q2 Direction',
      'Quarterly Update: Performance & Planning',
      'Strategic Priorities for Q2 2025',
    ],
    previewText: 'Q1 performance summary and strategic priorities for Q2...',
    bodyContent: `Q1 2025 Strategic Review

Performance Summary:
- Revenue: R 720K (+8.5% YoY)
- Margin: 62.8%
- Cash Position: R 360K

Q2 Priorities:
1. Expand marketing channels
2. Optimize operations
3. Strengthen cash position

Key Actions:
- Increase Google Ads budget
- Review supplier contracts
- Implement new forecasting system`,
    contentSources: [],
    scheduledDate: new Date(Date.now() + 604800000),
    sentDate: null,
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 259200000),
  },
  {
    id: '4',
    companyId: '1',
    title: 'Marketing Channel Analysis',
    status: 'DRAFT',
    subjectLines: [
      'Marketing Channel Deep Dive - Performance Analysis',
      'Channel Performance Review & Recommendations',
      'Optimizing Your Marketing Mix',
    ],
    previewText: 'Comprehensive analysis of Facebook, Google, and TikTok performance...',
    bodyContent: `Marketing Channel Analysis

Channel Performance:
- Google Ads: 3.85x ROAS
- Facebook: 2.42x ROAS
- TikTok: 1.85x ROAS

Recommendations:
1. Increase Google Ads budget
2. Expand Facebook campaigns
3. Test new TikTok creatives`,
    contentSources: [],
    scheduledDate: null,
    sentDate: null,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 172800000),
  },
];

/**
 * GET /api/newsletters
 * List newsletter drafts for a company
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: companyId',
        },
        { status: 400 }
      );
    }

    let filtered = MOCK_NEWSLETTERS.filter((n) => n.companyId === companyId);

    if (status) {
      filtered = filtered.filter((n) => n.status === status);
    }

    // Sort by date descending
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        newsletters: filtered,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch newsletters',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/newsletters
 * Generate a new newsletter draft
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, sources, template } = body;

    if (!companyId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: companyId',
        },
        { status: 400 }
      );
    }

    // In production:
    // 1. Fetch recent analyses and metrics based on sources
    // 2. Call Claude to generate newsletter content
    // 3. Create subject line variations
    // 4. Format content according to brand voice

    const newNewsletter = {
      id: `newsletter-${Date.now()}`,
      companyId,
      title: `${new Date().toLocaleDateString()} Newsletter Draft`,
      status: 'DRAFT',
      subjectLines: [
        'Weekly Business Digest - Your Performance Update',
        'Performance Review & Strategic Insights',
        'This Week\'s Key Metrics & Recommendations',
      ],
      previewText: 'Generated newsletter preview text...',
      bodyContent: 'Generated newsletter body content...',
      contentSources: sources || [],
      scheduledDate: null,
      sentDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(
      {
        success: true,
        newsletter: newNewsletter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating newsletter:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create newsletter',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/newsletters
 * Update newsletter status or schedule
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, scheduledDate, selectedSubject } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: id',
        },
        { status: 400 }
      );
    }

    // Find newsletter
    const newsletter = MOCK_NEWSLETTERS.find((n) => n.id === id);
    if (!newsletter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Newsletter not found',
        },
        { status: 404 }
      );
    }

    // Update newsletter
    if (status) newsletter.status = status;
    if (scheduledDate) newsletter.scheduledDate = new Date(scheduledDate);
    newsletter.updatedAt = new Date();

    return NextResponse.json(
      {
        success: true,
        newsletter,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating newsletter:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update newsletter',
      },
      { status: 500 }
    );
  }
}
