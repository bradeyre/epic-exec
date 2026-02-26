'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Loader2,
  Search,
  BarChart3,
  CheckSquare,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AnalysisRecord {
  id: string;
  functionName: string;
  title: string | null;
  healthScore: number | null;
  score: number | null;
  status: string;
  createdAt: string;
  outputData: any;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
}

function HealthBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return null;

  const config =
    score >= 70
      ? { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-800 dark:text-green-200', label: 'Healthy' }
      : score >= 50
        ? { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-800 dark:text-amber-200', label: 'Needs Attention' }
        : { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-800 dark:text-red-200', label: 'At Risk' };

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold text-accent">{score}</span>
      <Badge className={`${config.bg} ${config.text} text-xs`}>{config.label}</Badge>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    COMPLETED: { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-800 dark:text-green-200', label: 'Completed' },
    PROCESSING: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-800 dark:text-blue-200', label: 'Processing' },
    FAILED: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-800 dark:text-red-200', label: 'Failed' },
    DRAFT: { bg: 'bg-slate-100 dark:bg-slate-950', text: 'text-slate-800 dark:text-slate-200', label: 'Draft' },
  };
  const c = config[status] || config.DRAFT;
  return <Badge className={`${c.bg} ${c.text} text-xs`}>{c.label}</Badge>;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFunctionName(name: string) {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getExecutiveSummary(outputData: any): string | null {
  if (!outputData) return null;
  if (typeof outputData === 'string') {
    try {
      outputData = JSON.parse(outputData);
    } catch {
      return null;
    }
  }
  return outputData.executiveSummary || outputData.executive_summary || null;
}

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Fetch company
  useEffect(() => {
    fetch('/api/companies')
      .then((r) => r.json())
      .then((data) => {
        const companies = data.companies || data.data || [];
        if (data.success && companies.length > 0) {
          setCompanyId(companies[0].id);
        } else {
          // No companies — stop loading
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Fetch analyses
  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/analyses?companyId=${companyId}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAnalyses(data.data || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  const filtered = analyses.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.functionName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCompleted = analyses.filter((a) => a.status === 'COMPLETED').length;
  const avgScore =
    analyses.filter((a) => a.healthScore != null).length > 0
      ? Math.round(
          analyses
            .filter((a) => a.healthScore != null)
            .reduce((sum, a) => sum + (a.healthScore || 0), 0) /
            analyses.filter((a) => a.healthScore != null).length
        )
      : null;
  const totalTasks = analyses.reduce((sum, a) => sum + (a.tasks?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Past Analyses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review previous analyses, revisit insights, and track progress over time
          </p>
        </div>
        <Link href="/cfo">
          <Button className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Run New Analysis
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Analyses</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalCompleted}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Health Score</p>
          <p className="text-2xl font-bold text-foreground mt-1">{avgScore ?? '—'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Tasks Generated</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalTasks}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search analyses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <span className="ml-3 text-muted-foreground">Loading analyses...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {analyses.length === 0 ? 'No analyses yet' : 'No matching analyses'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {analyses.length === 0
              ? 'Run your first analysis to see results here. Jim will remember everything.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {analyses.length === 0 && (
            <Link href="/cfo">
              <Button>Run Your First Analysis</Button>
            </Link>
          )}
        </Card>
      )}

      {/* Analyses List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((analysis) => {
            const summary = getExecutiveSummary(analysis.outputData);
            const tasksDone = analysis.tasks?.filter((t) => t.status === 'DONE').length || 0;
            const tasksTotal = analysis.tasks?.length || 0;

            return (
              <Card
                key={analysis.id}
                className="p-6 hover:border-accent/50 transition-colors group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {formatFunctionName(analysis.functionName)}
                      </Badge>
                      <StatusBadge status={analysis.status} />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(analysis.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
                      {analysis.title || formatFunctionName(analysis.functionName)}
                    </h3>

                    {summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {summary}
                      </p>
                    )}

                    {/* Task progress */}
                    {tasksTotal > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>
                          {tasksDone}/{tasksTotal} tasks completed
                        </span>
                        <div className="flex-1 max-w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${(tasksDone / tasksTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side — score + action */}
                  <div className="flex lg:flex-col items-center lg:items-end gap-3">
                    <HealthBadge score={analysis.healthScore} />
                    <Link href={`/analyses/${analysis.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 group-hover:border-accent group-hover:text-accent"
                      >
                        View
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
