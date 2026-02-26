'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Simple Skeleton component
function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-muted animate-pulse rounded', className)} />;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
}

interface BookkeeperFeedback {
  reportQuality: 'good' | 'adequate' | 'needs-improvement';
  feedback: string;
  trainingNotes: string[];
}

interface AnalysisResult {
  executiveSummary: string;
  healthScore: number;
  healthStatus: 'red' | 'amber' | 'green';
  keyFindings: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  detailedAnalysis: Array<{
    title: string;
    content: string;
    chart?: {
      type: 'bar' | 'line' | 'pie';
      data: any[];
    };
  }>;
  recommendations: Recommendation[];
  actionItems: ActionItem[];
  bookkeeperFeedback?: BookkeeperFeedback | null;
}

interface StepAnalysisResultsProps {
  analysis?: AnalysisResult;
  isLoading?: boolean;
  onDownloadPDF?: () => void;
  onShare?: () => void;
  onRunAnother?: () => void;
}

const CHART_COLORS = ['#2563EB', '#10b981', '#60a5fa', '#ef4444', '#8b5cf6'];

const MOCK_ANALYSIS: AnalysisResult = {
  executiveSummary:
    'Your Google Ads campaigns are performing above industry benchmarks with a 4.2% conversion rate, but there is significant opportunity to optimize your audience targeting and reduce cost per acquisition through improved bid strategies. Implementing the recommended changes could reduce your customer acquisition cost by 18-25% while maintaining current conversion volumes.',
  healthScore: 72,
  healthStatus: 'amber',
  keyFindings: [
    {
      icon: '📊',
      title: 'Strong Conversion Rate',
      description: '4.2% conversion rate (industry avg: 2.1%)',
    },
    {
      icon: '💰',
      title: 'High Cost Per Click',
      description: 'R 45.23 average CPC (20% above competitors)',
    },
    {
      icon: '🎯',
      title: 'Audience Overlap',
      description: '34% of impressions are to overlapping audiences',
    },
    {
      icon: '📈',
      title: 'Growth Opportunity',
      description: 'Potential to scale spend by 40% without quality decay',
    },
  ],
  detailedAnalysis: [
    {
      title: 'Campaign Performance Overview',
      content:
        'Your top 3 campaigns account for 72% of total conversions. Campaign "Q4 Growth" shows the best ROI at 3.2x, while "Brand Awareness" needs optimization.',
      chart: {
        type: 'bar',
        data: [
          { name: 'Q4 Growth', conversions: 145, spend: 5200 },
          { name: 'Summer Sale', conversions: 89, spend: 4100 },
          { name: 'Brand Awareness', conversions: 56, spend: 3800 },
          { name: 'Retargeting', conversions: 34, spend: 1500 },
        ],
      },
    },
    {
      title: 'Monthly Trend Analysis',
      content:
        'Conversions show a strong upward trend over the past 6 months, with September showing peak performance at 324 conversions.',
      chart: {
        type: 'line',
        data: [
          { month: 'Apr', conversions: 156, spend: 6200 },
          { month: 'May', conversions: 178, spend: 6800 },
          { month: 'Jun', conversions: 201, spend: 7100 },
          { month: 'Jul', conversions: 245, spend: 7600 },
          { month: 'Aug', conversions: 289, spend: 8200 },
          { month: 'Sep', conversions: 324, spend: 8900 },
        ],
      },
    },
    {
      title: 'Device Performance Distribution',
      content:
        'Mobile devices account for 62% of conversions but only 48% of spend, suggesting significant optimization opportunity in mobile bid adjustments.',
      chart: {
        type: 'pie',
        data: [
          { name: 'Mobile', value: 62 },
          { name: 'Desktop', value: 32 },
          { name: 'Tablet', value: 6 },
        ],
      },
    },
  ],
  recommendations: [
    {
      id: '1',
      title: 'Implement Smart Bidding Strategy',
      description:
        'Migrate from manual CPC to Target CPA bidding for your top 3 campaigns. Expected impact: 15-20% reduction in CPA.',
      priority: 'critical',
    },
    {
      id: '2',
      title: 'Consolidate Overlapping Audiences',
      description:
        'Review and consolidate audience segments to reduce wasted impressions and improve campaign efficiency.',
      priority: 'high',
    },
    {
      id: '3',
      title: 'Optimize Mobile Bid Adjustments',
      description:
        'Increase mobile bid adjustments to +25% given stronger conversion performance on mobile devices.',
      priority: 'high',
    },
    {
      id: '4',
      title: 'Refine Ad Creative Testing',
      description:
        'Launch A/B tests for top 5 underperforming ad groups with new creative variations.',
      priority: 'medium',
    },
    {
      id: '5',
      title: 'Implement Conversion API Tracking',
      description:
        'Set up Google Conversion API for more accurate conversion tracking and better campaign optimization.',
      priority: 'medium',
    },
  ],
  actionItems: [
    {
      id: '1',
      title: 'Schedule Smart Bidding Strategy Review',
      description: 'Meet with team to plan implementation of Target CPA',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Audit Audience Segments',
      description: 'Identify overlapping audiences in Google Ads account',
      status: 'pending',
    },
    {
      id: '3',
      title: 'Update Mobile Bid Adjustments',
      description: 'Implement +25% adjustment across top 3 campaigns',
      status: 'pending',
    },
  ],
};

function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ChartRenderer({ type, data }: { type: string; data: any[] }) {
  if (!data || data.length === 0) return null;

  // Auto-detect keys from the first data object
  const firstItem = data[0];
  const allKeys = Object.keys(firstItem);

  // Find the label/category key (string-typed: "name", "month", "period", etc.)
  const LABEL_CANDIDATES = ['name', 'month', 'period', 'label', 'category', 'stage', 'channel'];
  const labelKey =
    allKeys.find((k) => LABEL_CANDIDATES.includes(k.toLowerCase())) ||
    allKeys.find((k) => typeof firstItem[k] === 'string') ||
    allKeys[0];

  // All numeric keys (excluding the label key) become bars/lines
  const numericKeys = allKeys.filter(
    (k) => k !== labelKey && typeof firstItem[k] === 'number'
  );

  const commonProps = {
    data,
    margin: { top: 20, right: 30, left: 0, bottom: 60 },
  };

  switch (type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} angle={-20} textAnchor="end" />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {numericKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {numericKeys.map((key, idx) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[idx % CHART_COLORS.length] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name} ${value}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
}

function HealthScoreBadge({ score, status }: { score: number; status: string }) {
  const statusConfig = {
    red: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-900 dark:text-red-100', label: 'At Risk' },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-950',
      text: 'text-amber-900 dark:text-amber-100',
      label: 'Needs Attention',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-950',
      text: 'text-green-900 dark:text-green-100',
      label: 'Healthy',
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <div className={`${config.bg} rounded-lg p-6 text-center`}>
      <div className="text-5xl font-bold text-accent mb-2">{score}</div>
      <div className={`text-sm font-semibold ${config.text}`}>
        {config.label} — {score >= 70 ? 'Good performance' : score >= 50 ? 'Room for improvement' : 'Critical attention needed'}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config = {
    critical: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-900 dark:text-red-100' },
    high: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-900 dark:text-blue-100' },
    medium: { bg: 'bg-slate-100 dark:bg-slate-950', text: 'text-slate-900 dark:text-slate-100' },
    low: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-900 dark:text-blue-100' },
  };

  const c = config[priority as keyof typeof config];
  return <Badge className={`${c.bg} ${c.text}`}>{priority.toUpperCase()}</Badge>;
}

export function StepAnalysisResults({
  analysis,
  isLoading = false,
  onDownloadPDF,
  onShare,
  onRunAnother,
}: StepAnalysisResultsProps) {
  // Use provided analysis or fall back to mock
  const displayAnalysis = analysis || MOCK_ANALYSIS;
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!isLoading && displayAnalysis.executiveSummary) {
      let index = 0;
      const timer = setInterval(() => {
        if (index < displayAnalysis.executiveSummary.length) {
          setDisplayedText(displayAnalysis.executiveSummary.substring(0, index));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 10);
      return () => clearInterval(timer);
    }
  }, [isLoading, displayAnalysis.executiveSummary]);

  if (isLoading) {
    return <AnalysisSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onDownloadPDF}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
        <Button onClick={onShare} variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share Analysis</span>
          <span className="sm:hidden">Share</span>
        </Button>
        <Button onClick={onRunAnother} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Run Another</span>
          <span className="sm:hidden">Another</span>
        </Button>
      </div>

      {/* Executive Summary */}
      <Card className="p-6 border-2 border-accent/50 bg-accent/5">
        <h2 className="text-lg font-bold text-foreground mb-3">Executive Summary</h2>
        <p className="text-foreground leading-relaxed">{displayedText}</p>
      </Card>

      {/* Health Score */}
      <HealthScoreBadge score={displayAnalysis.healthScore} status={displayAnalysis.healthStatus} />

      {/* Key Findings */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Key Findings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayAnalysis.keyFindings.map((finding, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="text-2xl mb-2">{finding.icon}</div>
              <h3 className="font-semibold text-foreground mb-1">{finding.title}</h3>
              <p className="text-sm text-muted-foreground">{finding.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Detailed Analysis */}
      <div className="space-y-4">
        {displayAnalysis.detailedAnalysis.map((section, idx) => (
          <Card key={idx} className="p-6">
            <button
              onClick={() =>
                setExpandedSections({
                  ...expandedSections,
                  [idx]: !expandedSections[idx],
                })
              }
              className="w-full text-left"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 transition-transform',
                    expandedSections[idx] && 'rotate-180'
                  )}
                />
              </div>
            </button>

            {expandedSections[idx] && (
              <div className="mt-4 space-y-4">
                <p className="text-foreground">{section.content}</p>
                {section.chart && (
                  <div className="mt-6 bg-background rounded-lg p-4">
                    <ChartRenderer type={section.chart.type} data={section.chart.data} />
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Recommendations</h2>
        <div className="space-y-3">
          {displayAnalysis.recommendations.map((rec) => (
            <div key={rec.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-foreground">{rec.title}</h3>
                <PriorityBadge priority={rec.priority} />
              </div>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Bookkeeper Feedback */}
      {displayAnalysis.bookkeeperFeedback && (
        <Card className="p-6 border-2 border-blue-500/30">
          <h2 className="text-lg font-bold text-foreground mb-4">Bookkeeper Feedback</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Report Quality:</span>
              <Badge className={
                displayAnalysis.bookkeeperFeedback.reportQuality === 'good'
                  ? 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100'
                  : displayAnalysis.bookkeeperFeedback.reportQuality === 'adequate'
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100'
                    : 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100'
              }>
                {displayAnalysis.bookkeeperFeedback.reportQuality.replace('-', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-foreground">{displayAnalysis.bookkeeperFeedback.feedback}</p>
            {displayAnalysis.bookkeeperFeedback.trainingNotes.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">Training Recommendations</h3>
                <ul className="space-y-2">
                  {displayAnalysis.bookkeeperFeedback.trainingNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Items Preview — nudge to Step 5 */}
      {displayAnalysis.actionItems.length > 0 && (
        <Card className="p-6 border-2 border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h2 className="text-lg font-bold text-foreground">
              {displayAnalysis.actionItems.length} Action Item{displayAnalysis.actionItems.length !== 1 ? 's' : ''} Generated
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Jim has identified concrete next steps based on this analysis. Click <strong>Next</strong> below to review, assign team members, set due dates, and create tasks.
          </p>
          <div className="flex flex-wrap gap-2">
            {displayAnalysis.actionItems.slice(0, 3).map((item) => (
              <Badge key={item.id} variant="outline" className="text-xs py-1">
                {item.title}
              </Badge>
            ))}
            {displayAnalysis.actionItems.length > 3 && (
              <Badge variant="outline" className="text-xs py-1 text-muted-foreground">
                +{displayAnalysis.actionItems.length - 3} more
              </Badge>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
