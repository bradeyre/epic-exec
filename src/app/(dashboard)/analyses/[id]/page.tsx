'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Download,
  Share2,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  Zap,
  CheckSquare,
  Clock,
  AlertCircle,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';

const CHART_COLORS = ['#2563EB', '#10b981', '#60a5fa', '#ef4444', '#8b5cf6'];

interface AnalysisDetail {
  id: string;
  functionName: string;
  title: string | null;
  module: string;
  healthScore: number | null;
  score: number | null;
  status: string;
  createdAt: string;
  outputData: any;
  inputData: any;
  processingTimeMs: number | null;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
  }>;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFunctionName(name: string) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function HealthScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const config =
    score >= 70
      ? { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-800 dark:text-green-200', label: 'Healthy' }
      : score >= 50
        ? { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-800 dark:text-amber-200', label: 'Needs Attention' }
        : { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-800 dark:text-red-200', label: 'At Risk' };

  return (
    <div className={`${config.bg} rounded-lg p-6 text-center`}>
      <div className="text-5xl font-bold text-accent mb-2">{score}</div>
      <div className={`text-sm font-semibold ${config.text}`}>
        {config.label} —{' '}
        {score >= 70
          ? 'Good performance'
          : score >= 50
            ? 'Room for improvement'
            : 'Critical attention needed'}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    CRITICAL: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-900 dark:text-red-100' },
    HIGH: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-900 dark:text-blue-100' },
    MEDIUM: { bg: 'bg-slate-100 dark:bg-slate-950', text: 'text-slate-900 dark:text-slate-100' },
    LOW: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-900 dark:text-blue-100' },
    critical: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-900 dark:text-red-100' },
    high: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-900 dark:text-blue-100' },
    medium: { bg: 'bg-slate-100 dark:bg-slate-950', text: 'text-slate-900 dark:text-slate-100' },
    low: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-900 dark:text-blue-100' },
  };
  const c = config[priority] || config.MEDIUM;
  return <Badge className={`${c.bg} ${c.text} text-xs`}>{priority.toUpperCase()}</Badge>;
}

function TaskStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'DONE':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'IN_PROGRESS':
      return <Clock className="w-4 h-4 text-blue-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  }
}

function ChartRenderer({ type, data }: { type: string; data: any[] }) {
  if (!data || data.length === 0) return null;
  const firstItem = data[0];
  const allKeys = Object.keys(firstItem);
  const LABEL_CANDIDATES = ['name', 'month', 'period', 'label', 'category', 'stage', 'channel'];
  const labelKey =
    allKeys.find((k) => LABEL_CANDIDATES.includes(k.toLowerCase())) ||
    allKeys.find((k) => typeof firstItem[k] === 'string') ||
    allKeys[0];
  const numericKeys = allKeys.filter((k) => k !== labelKey && typeof firstItem[k] === 'number');

  const commonProps = { data, margin: { top: 20, right: 30, left: 0, bottom: 60 } };

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
              <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={100} dataKey="value">
              {data.map((_, index) => (
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

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;

  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetch(`/api/analyses?id=${analysisId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAnalysis(data.analysis);
        } else {
          setError(data.error || 'Analysis not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [analysisId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <span className="ml-3 text-muted-foreground">Loading analysis...</span>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Analysis Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || 'Could not load this analysis.'}</p>
        <Link href="/analyses">
          <Button variant="outline">Back to Analyses</Button>
        </Link>
      </div>
    );
  }

  // Parse outputData
  let output = analysis.outputData;
  if (typeof output === 'string') {
    try {
      output = JSON.parse(output);
    } catch {
      output = {};
    }
  }

  const executiveSummary = output?.executiveSummary || output?.executive_summary || null;
  const keyFindings = output?.keyFindings || [];
  const detailedAnalysis = output?.detailedAnalysis || [];
  const recommendations = output?.recommendations || [];
  const bookkeeperFeedback = output?.bookkeeperFeedback || null;
  const tasksDone = analysis.tasks?.filter((t) => t.status === 'DONE').length || 0;
  const tasksTotal = analysis.tasks?.length || 0;

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/analyses')}
          className="mt-1"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="outline">{formatFunctionName(analysis.functionName)}</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(analysis.createdAt)}
            </span>
            {analysis.processingTimeMs && (
              <span className="text-xs text-muted-foreground">
                ({(analysis.processingTimeMs / 1000).toFixed(1)}s)
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {analysis.title || formatFunctionName(analysis.functionName)}
          </h1>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" className="gap-2" onClick={() => alert('PDF download coming soon')}>
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => alert('Share feature coming soon')}>
          <Share2 className="w-4 h-4" />
          Share
        </Button>
        <Link href={`/cfo/${analysis.functionName}`}>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Run Again
          </Button>
        </Link>
      </div>

      {/* Executive Summary */}
      {executiveSummary && (
        <Card className="p-6 border-2 border-accent/50 bg-accent/5">
          <h2 className="text-lg font-bold text-foreground mb-3">Executive Summary</h2>
          <p className="text-foreground leading-relaxed">{executiveSummary}</p>
        </Card>
      )}

      {/* Health Score */}
      <HealthScoreBadge score={analysis.healthScore} />

      {/* Key Findings */}
      {keyFindings.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Key Findings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyFindings.map((finding: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="text-2xl mb-2">{finding.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">{finding.title}</h3>
                <p className="text-sm text-muted-foreground">{finding.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Detailed Analysis */}
      {detailedAnalysis.length > 0 && (
        <div className="space-y-4">
          {detailedAnalysis.map((section: any, idx: number) => (
            <Card key={idx} className="p-6">
              <button
                onClick={() =>
                  setExpandedSections({ ...expandedSections, [idx]: !expandedSections[idx] })
                }
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                  <ChevronDown
                    className={cn('w-5 h-5 transition-transform', expandedSections[idx] && 'rotate-180')}
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
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Recommendations</h2>
          <div className="space-y-3">
            {recommendations.map((rec: any) => (
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
      )}

      {/* Bookkeeper Feedback */}
      {bookkeeperFeedback && (
        <Card className="p-6 border-2 border-blue-500/30">
          <h2 className="text-lg font-bold text-foreground mb-4">Bookkeeper Feedback</h2>
          <p className="text-foreground">{bookkeeperFeedback.feedback}</p>
          {bookkeeperFeedback.trainingNotes?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-foreground mb-2">Training Recommendations</h3>
              <ul className="space-y-2">
                {bookkeeperFeedback.trainingNotes.map((note: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Tasks from this Analysis */}
      {tasksTotal > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Tasks from this Analysis</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {tasksDone}/{tasksTotal} completed
              </p>
            </div>
            <Link href="/tasks">
              <Button variant="outline" size="sm" className="gap-1">
                <CheckSquare className="w-4 h-4" />
                View All Tasks
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {analysis.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <TaskStatusIcon status={task.status} />
                <span
                  className={cn(
                    'text-sm flex-1',
                    task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'
                  )}
                >
                  {task.title}
                </span>
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
