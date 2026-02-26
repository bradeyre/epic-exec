'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

// CFO Function Categories and Functions
const CFO_CATEGORIES = [
  {
    id: 'advisory',
    name: 'CFO Advisory',
    description: 'Strategic financial guidance for your business',
    functions: [
      {
        slug: 'cfo-advisory',
        name: 'General CFO Advisory',
        description: 'Get strategic financial advice as if you had a top-tier CFO on your team. Upload whatever you have — we\'ll tell you what matters most.',
        icon: '🧠',
        isNew: true,
      },
    ],
  },
  {
    id: 'reporting',
    name: 'Core Financial Reporting',
    description: 'Prepare financial statements and reports',
    functions: [
      {
        slug: 'pl-analysis',
        name: 'P&L Analysis',
        description: 'Income statement review and insights',
        icon: '💵',
        isNew: false,
      },
      {
        slug: 'balance-sheet',
        name: 'Balance Sheet Review',
        description: 'Assets, liabilities, and equity analysis',
        icon: '⚖️',
        isNew: false,
      },
      {
        slug: 'cash-flow-analysis',
        name: 'Cash Flow Analysis',
        description: 'Operating, investing, and financing flows',
        icon: '💰',
        isNew: false,
      },
      {
        slug: 'management-accounts',
        name: 'Management Accounts',
        description: 'Prepare monthly management reporting',
        icon: '📊',
        isNew: false,
      },
      {
        slug: 'financial-statements',
        name: 'Financial Statements',
        description: 'Complete financial reporting package',
        icon: '📋',
        isNew: false,
      },
      {
        slug: 'board-financial-report',
        name: 'Board Financial Report',
        description: 'Executive summary for board meetings',
        icon: '🎓',
        isNew: true,
      },
    ],
  },
  {
    id: 'planning',
    name: 'Planning & Forecasting',
    description: 'Budget and forecast your business',
    functions: [
      {
        slug: 'annual-budget-builder',
        name: 'Annual Budget Builder',
        description: 'Create comprehensive annual budgets',
        icon: '📅',
        isNew: false,
      },
      {
        slug: 'budget-vs-actual',
        name: 'Budget vs. Actual',
        description: 'Variance analysis and reporting',
        icon: '📈',
        isNew: false,
      },
      {
        slug: 'revenue-forecasting',
        name: 'Revenue Forecasting',
        description: 'Project future revenue streams',
        icon: '🔮',
        isNew: false,
      },
      {
        slug: 'scenario-planning',
        name: 'Scenario Planning',
        description: 'Model different business scenarios',
        icon: '🎯',
        isNew: false,
      },
      {
        slug: 'break-even-analysis',
        name: 'Break-Even Analysis',
        description: 'Calculate break-even points',
        icon: '📊',
        isNew: false,
      },
      {
        slug: 'capex-planning',
        name: 'CapEx Planning',
        description: 'Capital expenditure forecasting',
        icon: '🏗️',
        isNew: false,
      },
    ],
  },
  {
    id: 'cash',
    name: 'Cash & Treasury',
    description: 'Manage cash and liquidity',
    functions: [
      {
        slug: 'cash-runway',
        name: 'Cash Runway Analysis',
        description: 'Determine months of runway remaining',
        icon: '⏱️',
        isNew: false,
      },
      {
        slug: 'cash-flow-optimisation',
        name: 'Cash Flow Optimization',
        description: 'Improve cash conversion cycles',
        icon: '🔄',
        isNew: false,
      },
      {
        slug: 'working-capital',
        name: 'Working Capital Analysis',
        description: 'Optimize inventory, receivables, payables',
        icon: '⚙️',
        isNew: false,
      },
      {
        slug: 'debtor-management',
        name: 'Debtor Management',
        description: 'Accounts receivable strategies',
        icon: '🔗',
        isNew: false,
      },
      {
        slug: 'creditor-management',
        name: 'Creditor Management',
        description: 'Accounts payable optimization',
        icon: '💳',
        isNew: false,
      },
      {
        slug: 'loan-evaluation',
        name: 'Loan Evaluation',
        description: 'Assess financing options',
        icon: '🏦',
        isNew: true,
      },
    ],
  },
  {
    id: 'profitability',
    name: 'Profitability & Costing',
    description: 'Understand and improve profitability',
    functions: [
      {
        slug: 'pricing-strategy',
        name: 'Pricing Strategy',
        description: 'Optimize pricing models',
        icon: '💲',
        isNew: false,
      },
      {
        slug: 'product-profitability',
        name: 'Product Profitability',
        description: 'Margin analysis by product',
        icon: '📦',
        isNew: false,
      },
      {
        slug: 'customer-profitability',
        name: 'Customer Profitability',
        description: 'Analyze margin by customer',
        icon: '👥',
        isNew: false,
      },
      {
        slug: 'cost-optimisation',
        name: 'Cost Optimization',
        description: 'Identify cost reduction opportunities',
        icon: '✂️',
        isNew: false,
      },
      {
        slug: 'unit-economics',
        name: 'Unit Economics',
        description: 'Analyze per-unit economics',
        icon: '🧮',
        isNew: false,
      },
    ],
  },
  {
    id: 'strategic',
    name: 'Strategic Finance',
    description: 'Support strategic decisions',
    functions: [
      {
        slug: 'acquisition-due-diligence',
        name: 'Acquisition Due Diligence',
        description: 'Financial analysis for M&A',
        icon: '🔎',
        isNew: false,
      },
      {
        slug: 'business-valuation',
        name: 'Business Valuation',
        description: 'Determine enterprise value',
        icon: '💎',
        isNew: false,
      },
      {
        slug: 'investment-appraisal',
        name: 'Investment Appraisal',
        description: 'Evaluate investment opportunities',
        icon: '📈',
        isNew: false,
      },
      {
        slug: 'shareholder-distributions',
        name: 'Shareholder Distributions',
        description: 'Plan dividends and distributions',
        icon: '💸',
        isNew: false,
      },
      {
        slug: 'entity-structure',
        name: 'Entity Structure',
        description: 'Optimize corporate structure',
        icon: '🏢',
        isNew: false,
      },
      {
        slug: 'tax-planning',
        name: 'Tax Planning',
        description: 'Tax optimization strategies',
        icon: '📝',
        isNew: false,
      },
    ],
  },
  {
    id: 'compliance',
    name: 'Compliance & Governance',
    description: 'Ensure compliance and controls',
    functions: [
      {
        slug: 'vat-review',
        name: 'VAT Review',
        description: 'VAT compliance and optimization',
        icon: '🧾',
        isNew: false,
      },
      {
        slug: 'paye-analysis',
        name: 'PAYE Analysis',
        description: 'Employment tax compliance',
        icon: '👤',
        isNew: false,
      },
      {
        slug: 'financial-controls',
        name: 'Financial Controls',
        description: 'Audit and control assessment',
        icon: '🔐',
        isNew: false,
      },
      {
        slug: 'insurance-review',
        name: 'Insurance Review',
        description: 'Coverage and risk assessment',
        icon: '🛡️',
        isNew: false,
      },
      {
        slug: 'regulatory-compliance',
        name: 'Regulatory Compliance',
        description: 'Industry-specific compliance',
        icon: '⚖️',
        isNew: true,
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics & KPIs',
    description: 'Measure financial performance',
    functions: [
      {
        slug: 'financial-health-dashboard',
        name: 'Financial Health Dashboard',
        description: 'Key financial metrics dashboard',
        icon: '📊',
        isNew: false,
      },
      {
        slug: 'kpi-framework',
        name: 'KPI Framework',
        description: 'Define financial KPIs',
        icon: '🎯',
        isNew: false,
      },
      {
        slug: 'ratio-analysis',
        name: 'Ratio Analysis',
        description: 'Financial ratio calculations',
        icon: '📐',
        isNew: false,
      },
      {
        slug: 'trend-anomaly-detection',
        name: 'Trend & Anomaly Detection',
        description: 'Identify trends and outliers',
        icon: '📉',
        isNew: false,
      },
      {
        slug: 'financial-scorecard',
        name: 'Financial Scorecard',
        description: 'Balanced scorecard for finance',
        icon: '🏆',
        isNew: false,
      },
    ],
  },
];

interface RecentAnalysis {
  id: string;
  functionName: string;
  date: string;
  status: 'completed' | 'in-progress' | 'draft';
}

export default function CFOPage() {
  const [recentAnalyses] = useState<RecentAnalysis[]>([
    {
      id: '1',
      functionName: 'P&L Analysis',
      date: '1 day ago',
      status: 'completed',
    },
    {
      id: '2',
      functionName: 'Cash Flow Analysis',
      date: '3 days ago',
      status: 'completed',
    },
    {
      id: '3',
      functionName: 'Revenue Forecasting',
      date: '1 week ago',
      status: 'completed',
    },
    {
      id: '4',
      functionName: 'Budget vs Actual',
      date: '2 weeks ago',
      status: 'completed',
    },
    {
      id: '5',
      functionName: 'Balance Sheet Review',
      date: '3 weeks ago',
      status: 'completed',
    },
  ]);

  const totalAnalyses = recentAnalyses.length;
  const lastAnalysisDate = recentAnalyses[0]?.date || 'Never';
  const activeTasks = 8;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">CFO Module</h1>
        <p className="text-muted-foreground mt-2">
          Run analyses on your financial functions and get AI-powered recommendations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Analyses</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalAnalyses}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Last Analysis</p>
              <p className="text-lg font-semibold text-foreground mt-1">{lastAnalysisDate}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Tasks</p>
              <p className="text-3xl font-bold text-foreground mt-1">{activeTasks}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Recently Run Section */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Recently Run</h2>
        <div className="space-y-2">
          {recentAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-foreground">{analysis.functionName}</p>
                  <p className="text-xs text-muted-foreground">{analysis.date}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {analysis.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* CFO Advisory — Hero Card */}
      <Link href="/cfo/cfo-advisory">
        <Card className="p-8 hover:shadow-xl hover:border-accent transition-all cursor-pointer group border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🧠</span>
                <Badge className="bg-accent/20 text-accent text-xs font-semibold">NEW</Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                General CFO Advisory
              </h2>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Get strategic financial advice as if you had a top-tier CFO on your team. Upload whatever you have — P&Ls, bookkeeper emails, screenshots — and we&apos;ll tell you what matters most right now for a business heading toward R100m/y.
              </p>
              <div className="flex items-center gap-2 text-accent mt-4 group-hover:gap-3 transition-all">
                <span className="text-sm font-semibold">Get CFO Advice</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Card>
      </Link>

      {/* Functions by Category */}
      {CFO_CATEGORIES.filter((c) => c.id !== 'advisory').map((category) => (
        <div key={category.id} className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
            <p className="text-muted-foreground mt-1">{category.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.functions.map((func) => (
              <Link key={func.slug} href={`/cfo/${func.slug}`}>
                <Card className="p-6 h-full hover:shadow-lg hover:border-accent transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{func.icon}</span>
                    {func.isNew && (
                      <Badge className="bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100 text-xs">
                        NEW
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                    {func.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">{func.description}</p>

                  <div className="flex items-center gap-2 text-accent mt-4 group-hover:gap-3 transition-all">
                    <span className="text-sm font-medium">Start Analysis</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
