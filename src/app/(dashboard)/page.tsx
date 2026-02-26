'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/metric-card';
import { HealthBadge } from '@/components/dashboard/health-badge';
import { Sparkline } from '@/components/dashboard/sparkline';
import { useCurrentCompany } from '@/hooks/use-company';
import { cn } from '@/lib/utils';

// Mock data for development
const MOCK_METRICS = {
  cashPosition: {
    current: 285400,
    change: 12.5,
    sparkline: [180000, 195000, 210000, 220000, 250000, 275000, 285400],
    trend: 'up' as const,
  },
  revenueMTD: {
    current: 156250,
    target: 150000,
    change: 4.2,
    sparkline: [35000, 38000, 42000, 41500, 40000],
  },
  googleAdsROAS: {
    current: 3.85,
    change: -2.1,
    sparkline: [3.2, 3.5, 4.1, 4.2, 4.0, 3.9, 3.85],
    trend: 'down' as const,
  },
  activeTasks: {
    total: 24,
    overdue: 3,
  },
  grossMargin: {
    current: 58.5,
    change: 1.8,
    sparkline: [55.2, 56.1, 57.0, 57.8, 58.2, 58.5],
    target: 60,
  },
  outstandingDebtors: {
    current: 89200,
    days: 38,
    change: -8.3,
  },
};

const MOCK_ALERTS = [
  {
    id: '1',
    severity: 'RED' as const,
    title: 'Cash Position Alert',
    message: 'Significant cash outflow expected next week (R45K)',
    timestamp: new Date(),
  },
  {
    id: '2',
    severity: 'AMBER' as const,
    title: 'Google Ads ROAS Decline',
    message: 'ROAS dropped 2.1% this week. Review bid strategy.',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    severity: 'GREEN' as const,
    title: 'Revenue Target Met',
    message: 'MTD revenue exceeded target by 4.2%',
    timestamp: new Date(Date.now() - 7200000),
  },
];

const MOCK_ANALYSES = [
  {
    id: '1',
    module: 'CFO',
    function: 'Cash Flow Analysis',
    date: new Date(Date.now() - 86400000),
    healthScore: 55,
    title: 'Q1 Cash Flow Review',
  },
  {
    id: '2',
    module: 'CMO',
    function: 'Campaign Performance',
    date: new Date(Date.now() - 172800000),
    healthScore: 35,
    title: 'Google Ads Performance Review',
  },
  {
    id: '3',
    module: 'CFO',
    function: 'Margin Analysis',
    date: new Date(Date.now() - 259200000),
    healthScore: 78,
    title: 'Gross Margin Optimization',
  },
  {
    id: '4',
    module: 'CMO',
    function: 'Market Positioning',
    date: new Date(Date.now() - 345600000),
    healthScore: 78,
    title: 'Market Position Assessment',
  },
  {
    id: '5',
    module: 'CFO',
    function: 'Revenue Forecast',
    date: new Date(Date.now() - 432000000),
    healthScore: 55,
    title: 'Q2 Revenue Forecast',
  },
];

const MOCK_OVERDUE_TASKS = [
  {
    id: '1',
    title: 'Implement Google Ads budget increase',
    priority: 'HIGH' as const,
    dueDate: new Date(Date.now() - 172800000),
    module: 'CMO',
  },
  {
    id: '2',
    title: 'Review supplier contracts for savings',
    priority: 'CRITICAL' as const,
    dueDate: new Date(Date.now() - 86400000),
    module: 'CFO',
  },
  {
    id: '3',
    title: 'Update brand messaging for Q2 campaign',
    priority: 'MEDIUM' as const,
    dueDate: new Date(Date.now() - 43200000),
    module: 'CMO',
  },
];

const getSeverityColor = (severity: 'RED' | 'AMBER' | 'GREEN') => {
  const colors = {
    RED: 'bg-red-500/10 border-red-500/20 text-red-400',
    AMBER: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    GREEN: 'bg-green-500/10 border-green-500/20 text-green-400',
  };
  return colors[severity];
};

const getSeverityIcon = (severity: 'RED' | 'AMBER' | 'GREEN') => {
  const icons = {
    RED: <AlertCircle className="w-5 h-5" />,
    AMBER: <AlertTriangle className="w-5 h-5" />,
    GREEN: <CheckCircle className="w-5 h-5" />,
  };
  return icons[severity];
};

const getPriorityColor = (priority: string) => {
  const colors = {
    CRITICAL: 'bg-red-500/20 text-red-400',
    HIGH: 'bg-orange-500/20 text-orange-400',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400',
    LOW: 'bg-gray-500/20 text-gray-400',
  };
  return colors[priority as keyof typeof colors] || colors.LOW;
};

export default function DashboardPage() {
  const company = useCurrentCompany();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const visibleAlerts = MOCK_ALERTS.filter((a) => !dismissedAlerts.includes(a.id));

  const handleDismissAlert = (id: string) => {
    setDismissedAlerts((prev) => [...prev, id]);
  };

  const userName = 'Brad';
  const greeting = `Good morning, ${userName}`;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pt-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-1">{greeting}</h1>
        <p className="text-slate-400">
          {company?.name} • {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Cash Position"
          value={`R ${(MOCK_METRICS.cashPosition.current / 1000).toFixed(0)}K`}
          change={MOCK_METRICS.cashPosition.change}
          trend={MOCK_METRICS.cashPosition.trend}
          sparkline={MOCK_METRICS.cashPosition.sparkline}
          chart={{ type: 'area' }}
        />
        <MetricCard
          title="Revenue MTD"
          value={`R ${(MOCK_METRICS.revenueMTD.current / 1000).toFixed(0)}K`}
          subtitle={`Target: R ${(MOCK_METRICS.revenueMTD.target / 1000).toFixed(0)}K`}
          change={MOCK_METRICS.revenueMTD.change}
          trend="up"
          sparkline={MOCK_METRICS.revenueMTD.sparkline}
        />
        <MetricCard
          title="Google Ads ROAS"
          value={`${MOCK_METRICS.googleAdsROAS.current.toFixed(2)}x`}
          change={MOCK_METRICS.googleAdsROAS.change}
          trend={MOCK_METRICS.googleAdsROAS.trend}
          sparkline={MOCK_METRICS.googleAdsROAS.sparkline}
        />
        <MetricCard
          title="Active Tasks"
          value={MOCK_METRICS.activeTasks.total.toString()}
          subtitle={`${MOCK_METRICS.activeTasks.overdue} overdue`}
          subtitleColor="text-red-400"
        />
        <MetricCard
          title="Gross Margin %"
          value={`${MOCK_METRICS.grossMargin.current.toFixed(1)}%`}
          subtitle={`Target: ${MOCK_METRICS.grossMargin.target}%`}
          change={MOCK_METRICS.grossMargin.change}
          trend="up"
          sparkline={MOCK_METRICS.grossMargin.sparkline}
        />
        <MetricCard
          title="Outstanding Debtors"
          value={`R ${(MOCK_METRICS.outstandingDebtors.current / 1000).toFixed(0)}K`}
          subtitle={`${MOCK_METRICS.outstandingDebtors.days} days average`}
          change={MOCK_METRICS.outstandingDebtors.change}
          trend="up"
        />
      </div>

      {/* Alerts Section */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">Proactive Alerts</h2>
          <div className="space-y-2">
            {visibleAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border',
                  getSeverityColor(alert.severity),
                )}
              >
                <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{alert.title}</h3>
                    <Badge
                      variant="outline"
                      className="text-xs bg-transparent border-current"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm opacity-90">{alert.message}</p>
                </div>
                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="text-current opacity-60 hover:opacity-100 transition-opacity p-1"
                  title="Dismiss"
                >
                  <span className="sr-only">Dismiss</span>
                  <span className="text-lg">×</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Analyses */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Recent Analyses</h2>
        <div className="space-y-2">
          {MOCK_ANALYSES.map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {analysis.module}
                    </Badge>
                    <span className="text-sm text-slate-400">
                      {analysis.function}
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-100 truncate">
                    {analysis.title}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {format(analysis.date, 'MMM d')}
                </span>
                <HealthBadge score={analysis.healthScore} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Tasks */}
      {MOCK_OVERDUE_TASKS.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">
            Overdue Tasks ({MOCK_OVERDUE_TASKS.length})
          </h2>
          <div className="space-y-2">
            {MOCK_OVERDUE_TASKS.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-slate-100 truncate">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {task.module}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {Math.ceil(
                          (Date.now() - task.dueDate.getTime()) / (1000 * 3600 * 24),
                        )}{' '}
                        days overdue
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2 text-left border-slate-700 hover:border-blue-500 hover:bg-blue-500/10"
          >
            <span className="text-sm font-medium text-slate-300">Run Ad Review</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2 text-left border-slate-700 hover:border-blue-500 hover:bg-blue-500/10"
          >
            <span className="text-sm font-medium text-slate-300">View Tasks</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2 text-left border-slate-700 hover:border-blue-500 hover:bg-blue-500/10"
          >
            <span className="text-sm font-medium text-slate-300">Full Dashboard</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Button>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2 text-left border-slate-700 hover:border-blue-500 hover:bg-blue-500/10"
          >
            <span className="text-sm font-medium text-slate-300">New Analysis</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}
