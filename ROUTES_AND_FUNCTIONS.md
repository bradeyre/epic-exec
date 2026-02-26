# Virtual Executive - Complete Routes & Functions Reference

## URL Routes Map

### Authentication Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/login` | `(auth)/login/page.tsx` | User login |
| `/register` | `(auth)/register/page.tsx` | New account registration |
| `/` | `page.tsx` | Root (redirects to /cmo or /login) |

### CMO Module Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/cmo` | `(dashboard)/cmo/page.tsx` | CMO module landing (40 functions) |
| `/cmo/[function-slug]` | `(dashboard)/cmo/[function]/page.tsx` | Dynamic CMO wizard |

### CFO Module Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/cfo` | `(dashboard)/cfo/page.tsx` | CFO module landing (40 functions) |
| `/cfo/[function-slug]` | `(dashboard)/cfo/[function]/page.tsx` | Dynamic CFO wizard |

## CMO Functions (40 Total)

### Advertising & Paid Media (10)
| Slug | Name | Description |
|------|------|-------------|
| `google-ads-audit` | Google Ads Audit | Comprehensive analysis of Google Ads campaigns |
| `facebook-ads-audit` | Facebook Ads Audit | Performance review and optimization |
| `tiktok-ads` | TikTok Ads Strategy | Develop TikTok advertising strategy |
| `linkedin-ads` | LinkedIn Ads Audit | B2B advertising performance analysis |
| `marketplace-ads` | Marketplace Ads Review | Takealot and Amazon advertising |
| `budget-allocator` | Budget Allocator | Optimal channel budget distribution |
| `ad-creative-review` | Ad Creative Review | Analyze and improve ad creatives |
| `audience-strategy` | Audience Strategy | Define and refine target audiences |
| `retargeting-strategy` | Retargeting Strategy | Re-engage interested prospects |
| `attribution-modelling` | Attribution Modelling | Understand multi-touch attribution |

**URL Examples:**
- `/cmo/google-ads-audit`
- `/cmo/facebook-ads-audit`
- `/cmo/tiktok-ads`
- `/cmo/linkedin-ads`

### SEO & Organic (6)
| Slug | Name | Description |
|------|------|-------------|
| `seo-audit` | SEO Audit | Technical and on-page SEO review |
| `keyword-research` | Keyword Research | Identify high-value keywords |
| `content-brief-generator` | Content Brief Generator | Create data-driven content briefs |
| `on-page-seo` | On-Page SEO | Optimize individual pages |
| `local-seo` | Local SEO | Improve local search visibility |
| `technical-seo` | Technical SEO | Fix technical issues |

**URL Examples:**
- `/cmo/seo-audit`
- `/cmo/keyword-research`
- `/cmo/technical-seo`

### Content & Social (6)
| Slug | Name | Description |
|------|------|-------------|
| `content-strategy` | Content Strategy | Develop comprehensive content strategy |
| `social-media-strategy` | Social Media Strategy | Plan social media approach |
| `social-media-calendar` | Social Media Calendar | Generate content calendar |
| `email-marketing-audit` | Email Marketing Audit | Review email campaigns |
| `email-sequence-builder` | Email Sequence Builder | Design email workflows |
| `video-marketing` | Video Marketing Strategy | Plan video content strategy |

**URL Examples:**
- `/cmo/content-strategy`
- `/cmo/social-media-strategy`
- `/cmo/video-marketing`

### Brand & Strategy (8)
| Slug | Name | Description |
|------|------|-------------|
| `brand-strategy` | Brand Strategy | Develop brand positioning |
| `competitor-analysis` | Competitor Analysis | Analyze competitive landscape |
| `go-to-market` | Go-to-Market Strategy | Plan market entry strategy |
| `customer-journey` | Customer Journey | Map customer touchpoints |
| `channel-assessment` | Channel Assessment | Evaluate marketing channels |
| `pricing-promotion` | Pricing & Promotion | Optimize pricing strategy |
| `partnership-strategy` | Partnership Strategy | Identify partnership opportunities |
| `referral-programme` | Referral Programme | Design referral mechanics |

**URL Examples:**
- `/cmo/brand-strategy`
- `/cmo/competitor-analysis`
- `/cmo/go-to-market`
- `/cmo/partnership-strategy`

### Analytics & Reporting (6)
| Slug | Name | Description |
|------|------|-------------|
| `kpi-dashboard-setup` | KPI Dashboard Setup | Configure marketing dashboards |
| `full-funnel-analysis` | Full Funnel Analysis | Analyze conversion funnel |
| `customer-lifetime-value` | Customer Lifetime Value | Calculate and optimize CLV |
| `cohort-analysis` | Cohort Analysis | Track customer cohorts |
| `marketing-roi-report` | Marketing ROI Report | Measure marketing ROI |
| `competitive-benchmarking` | Competitive Benchmarking | Benchmark against competitors |

**URL Examples:**
- `/cmo/kpi-dashboard-setup`
- `/cmo/full-funnel-analysis`
- `/cmo/customer-lifetime-value`

### Marketplace (4)
| Slug | Name | Description |
|------|------|-------------|
| `takealot-listing` | Takealot Listing Optimization | Improve Takealot product listings |
| `amazon-listing` | Amazon Listing Optimization | Optimize Amazon product listings |
| `marketplace-pricing` | Marketplace Pricing | Dynamic pricing strategy |
| `multi-channel-strategy` | Multi-Channel Strategy | Coordinate across marketplaces |

**URL Examples:**
- `/cmo/takealot-listing`
- `/cmo/amazon-listing`
- `/cmo/multi-channel-strategy`

---

## CFO Functions (40 Total)

### Core Financial Reporting (6)
| Slug | Name | Description |
|------|------|-------------|
| `pl-analysis` | P&L Analysis | Income statement review and insights |
| `balance-sheet` | Balance Sheet Review | Assets, liabilities, equity analysis |
| `cash-flow-analysis` | Cash Flow Analysis | Operating, investing, financing flows |
| `management-accounts` | Management Accounts | Prepare monthly management reporting |
| `financial-statements` | Financial Statements | Complete financial reporting package |
| `board-financial-report` | Board Financial Report | Executive summary for board meetings |

**URL Examples:**
- `/cfo/pl-analysis`
- `/cfo/balance-sheet`
- `/cfo/cash-flow-analysis`
- `/cfo/board-financial-report`

### Planning & Forecasting (6)
| Slug | Name | Description |
|------|------|-------------|
| `annual-budget-builder` | Annual Budget Builder | Create comprehensive annual budgets |
| `budget-vs-actual` | Budget vs. Actual | Variance analysis and reporting |
| `revenue-forecasting` | Revenue Forecasting | Project future revenue streams |
| `scenario-planning` | Scenario Planning | Model different business scenarios |
| `break-even-analysis` | Break-Even Analysis | Calculate break-even points |
| `capex-planning` | CapEx Planning | Capital expenditure forecasting |

**URL Examples:**
- `/cfo/annual-budget-builder`
- `/cfo/revenue-forecasting`
- `/cfo/scenario-planning`

### Cash & Treasury (6)
| Slug | Name | Description |
|------|------|-------------|
| `cash-runway` | Cash Runway Analysis | Determine months of runway remaining |
| `cash-flow-optimisation` | Cash Flow Optimization | Improve cash conversion cycles |
| `working-capital` | Working Capital Analysis | Optimize inventory, receivables, payables |
| `debtor-management` | Debtor Management | Accounts receivable strategies |
| `creditor-management` | Creditor Management | Accounts payable optimization |
| `loan-evaluation` | Loan Evaluation | Assess financing options |

**URL Examples:**
- `/cfo/cash-runway`
- `/cfo/cash-flow-optimisation`
- `/cfo/working-capital`
- `/cfo/loan-evaluation`

### Profitability & Costing (5)
| Slug | Name | Description |
|------|------|-------------|
| `pricing-strategy` | Pricing Strategy | Optimize pricing models |
| `product-profitability` | Product Profitability | Margin analysis by product |
| `customer-profitability` | Customer Profitability | Analyze margin by customer |
| `cost-optimisation` | Cost Optimization | Identify cost reduction opportunities |
| `unit-economics` | Unit Economics | Analyze per-unit economics |

**URL Examples:**
- `/cfo/pricing-strategy`
- `/cfo/product-profitability`
- `/cfo/unit-economics`

### Strategic Finance (6)
| Slug | Name | Description |
|------|------|-------------|
| `acquisition-due-diligence` | Acquisition Due Diligence | Financial analysis for M&A |
| `business-valuation` | Business Valuation | Determine enterprise value |
| `investment-appraisal` | Investment Appraisal | Evaluate investment opportunities |
| `shareholder-distributions` | Shareholder Distributions | Plan dividends and distributions |
| `entity-structure` | Entity Structure | Optimize corporate structure |
| `tax-planning` | Tax Planning | Tax optimization strategies |

**URL Examples:**
- `/cfo/acquisition-due-diligence`
- `/cfo/business-valuation`
- `/cfo/investment-appraisal`
- `/cfo/tax-planning`

### Compliance & Governance (5)
| Slug | Name | Description |
|------|------|-------------|
| `vat-review` | VAT Review | VAT compliance and optimization |
| `paye-analysis` | PAYE Analysis | Employment tax compliance |
| `financial-controls` | Financial Controls | Audit and control assessment |
| `insurance-review` | Insurance Review | Coverage and risk assessment |
| `regulatory-compliance` | Regulatory Compliance | Industry-specific compliance |

**URL Examples:**
- `/cfo/vat-review`
- `/cfo/paye-analysis`
- `/cfo/financial-controls`
- `/cfo/regulatory-compliance`

### Analytics & KPIs (5)
| Slug | Name | Description |
|------|------|-------------|
| `financial-health-dashboard` | Financial Health Dashboard | Key financial metrics dashboard |
| `kpi-framework` | KPI Framework | Define financial KPIs |
| `ratio-analysis` | Ratio Analysis | Financial ratio calculations |
| `trend-anomaly-detection` | Trend & Anomaly Detection | Identify trends and outliers |
| `financial-scorecard` | Financial Scorecard | Balanced scorecard for finance |

**URL Examples:**
- `/cfo/financial-health-dashboard`
- `/cfo/kpi-framework`
- `/cfo/ratio-analysis`
- `/cfo/financial-scorecard`

---

## Function Configuration Structure

Each function in the wizards is configured with:

```typescript
{
  slug: string;              // URL parameter
  name: string;              // Display name
  description: string;       // Brief description
  category: string;          // Category name
  focusAreas: Array<{
    id: string;             // Unique identifier
    title: string;          // Focus area name
    description: string;    // Explanation
  }>;
}
```

### Example Configuration
```typescript
'google-ads-audit': {
  slug: 'google-ads-audit',
  name: 'Google Ads Audit',
  description: 'Comprehensive analysis of your Google Ads campaigns',
  category: 'Advertising & Paid Media',
  focusAreas: [
    { id: '1', title: 'Campaign Performance', description: 'Analyze campaign-level metrics' },
    { id: '2', title: 'Ad Group Efficiency', description: 'Review ad group performance' },
    { id: '3', title: 'Keyword Quality', description: 'Assess keyword relevance and quality' },
    { id: '4', title: 'Budget Allocation', description: 'Optimize budget distribution' },
    { id: '5', title: 'Conversion Tracking', description: 'Review conversion setup' },
    { id: '6', title: 'Landing Page Quality', description: 'Analyze landing page experience' },
  ],
}
```

---

## Quick Reference: Most Popular Routes

### CMO Top Functions
- `/cmo/google-ads-audit` - Most requested CMO function
- `/cmo/facebook-ads-audit` - Close second
- `/cmo/seo-audit` - Most popular SEO function
- `/cmo/brand-strategy` - Most popular brand function

### CFO Top Functions
- `/cfo/pl-analysis` - Most requested CFO function
- `/cfo/cash-runway` - Critical for startups
- `/cfo/revenue-forecasting` - Popular planning function
- `/cfo/financial-health-dashboard` - KPI function

---

## Adding New Functions

To add a new function:

1. **Choose module**: CMO or CFO
2. **Define slug**: Lowercase, hyphenated (e.g., `new-function`)
3. **Add to config**: Update function config in `[function]/page.tsx`
4. **URL becomes**: `/cmo/new-function` or `/cfo/new-function`
5. **Function auto-routes**: Wizard loads with that function's config

No additional files needed - the wizard is fully generic.

---

## Function Statistics

### CMO
- **Total Functions**: 40
- **Average Focus Areas**: 5.5 per function
- **Total Focus Areas**: 220+

### CFO
- **Total Functions**: 40
- **Average Focus Areas**: 5.3 per function
- **Total Focus Areas**: 212+

### Overall
- **Total Functions**: 80
- **Total Categories**: 13
- **Total Focus Areas**: 432+

---

## Testing Checklist

Use this checklist to verify all routes work:

### CMO Functions
- [ ] `/cmo/google-ads-audit`
- [ ] `/cmo/facebook-ads-audit`
- [ ] `/cmo/tiktok-ads`
- [ ] `/cmo/linkedin-ads`
- [ ] `/cmo/seo-audit`
- [ ] `/cmo/keyword-research`
- [ ] `/cmo/content-strategy`
- [ ] `/cmo/social-media-strategy`
- [ ] `/cmo/brand-strategy`
- [ ] `/cmo/competitor-analysis`

### CFO Functions
- [ ] `/cfo/pl-analysis`
- [ ] `/cfo/balance-sheet`
- [ ] `/cfo/cash-flow-analysis`
- [ ] `/cfo/annual-budget-builder`
- [ ] `/cfo/revenue-forecasting`
- [ ] `/cfo/cash-runway`
- [ ] `/cfo/working-capital`
- [ ] `/cfo/pricing-strategy`
- [ ] `/cfo/business-valuation`
- [ ] `/cfo/financial-health-dashboard`

### Auth Routes
- [ ] `/login`
- [ ] `/register`
- [ ] `/` (redirect to /cmo)

### Invalid Routes
- [ ] `/cmo/invalid-function` (should 404)
- [ ] `/cfo/invalid-function` (should 404)
