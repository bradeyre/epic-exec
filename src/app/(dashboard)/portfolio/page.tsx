'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/metric-card';
import { HealthBadge } from '@/components/dashboard/health-badge';
import { Sparkline } from '@/components/dashboard/sparkline';
import { useSwitchCompany } from '@/hooks/use-company';
import { TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';

// Mock portfolio data
const PORTFOLIO_COMPANIES = [
  {
    id: '1',
    name: 'Epic Deals',
    healthScore: 78,
    revenue: 2450000,
    revenueSparkline: [185000, 192000, 198500, 205000, 198000, 210000, 215000, 208000, 220000, 225000, 235000, 245000],
    profitability: 62.8,
    cashPosition: 360000,
    alerts: 0,
  },
  {
    id: '2',
    name: 'Platinum Repairs',
    healthScore: 55,
    revenue: 1850000,
    revenueSparkline: [145000, 148000, 152000, 155000, 152000, 160000, 162000, 158000, 165000, 168000, 172000, 185000],
    profitability: 55.2,
    cashPosition: 245000,
    alerts: 1,
  },
  {
    id: '3',
    name: 'Everyday Adventure',
    healthScore: 78,
    revenue: 1620000,
    revenueSparkline: [128000, 130000, 135000, 138000, 135000, 140000, 142000, 138000, 145000, 148000, 152000, 162000],
    profitability: 58.5,
    cashPosition: 195000,
    alerts: 0,
  },
  {
    id: '4',
    name: 'The Automators',
    healthScore: 55,
    revenue: 980000,
    revenueSparkline: [75000, 78000, 81000, 84000, 81000, 88000, 90000, 87000, 92000, 94000, 97000, 98000],
    profitability: 48.3,
    cashPosition: 125000,
    alerts: 2,
  },
  {
    id: '5',
    name: 'Epic Rentals',
    healthScore: 55,
    revenue: 1240000,
    revenueSparkline: [95000, 98000, 102000, 105000, 102000, 110000, 112000, 110000, 115000, 118000, 120000, 124000],
    profitability: 52.1,
    cashPosition: 180000,
    alerts: 1,
  },
];

const PORTFOLIO_REVENUE_TREND = [
  { month: 'Jan', 'Epic Deals': 185000, 'Platinum Repairs': 145000, 'Everyday Adventure': 128000, 'The Automators': 75000, 'Epic Rentals': 95000 },
  { month: 'Feb', 'Epic Deals': 192000, 'Platinum Repairs': 148000, 'Everyday Adventure': 130000, 'The Automators': 78000, 'Epic Rentals': 98000 },
  { month: 'Mar', 'Epic Deals': 198500, 'Platinum Repairs': 152000, 'Everyday Adventure': 135000, 'The Automators': 81000, 'Epic Rentals': 102000 },
  { month: 'Apr', 'Epic Deals': 205000, 'Platinum Repairs': 155000, 'Everyday Adventure': 138000, 'The Automators': 84000, 'Epic Rentals': 105000 },
  { month: 'May', 'Epic Deals': 198000, 'Platinum Repairs': 152000, 'Everyday Adventure': 135000, 'The Automators': 81000, 'Epic Rentals': 102000 },
  { month: 'Jun', 'Epic Deals': 210000, 'Platinum Repairs': 160000, 'Everyday Adventure': 140000, 'The Automators': 88000, 'Epic Rentals': 110000 },
];

const NEEDS_ATTENTION = [
  {
    id: '1',
    company: 'The Automators',
    issue: 'Cash position below 3-month runway',
    severity: 'HIGH',
  },
  {
    id: '2',
    company: 'Platinum Repairs',
    issue: 'Gross margin declining for 2 months',
    severity: 'AMBER',
  },
  {
    id: '3',
    company: 'Epic Rentals',
    issue: 'Outstanding debtors aging beyond 45 days',
    severity: 'AMBER',
  },
];

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

export default function PortfolioPage() {
  const switchCompany = useSwitchCompany();

  const totalRevenue = PORTFOLIO_COMPANIES.reduce((sum, c) => sum + c.revenue, 0);
  const totalCashPosition = PORTFOLIO_COMPANIES.reduce((sum, c) => sum + c.cashPosition, 0);
  const avgProfitability = (
    PORTFOLIO_COMPANIES.reduce((sum, c) => sum + c.profitability, 0) /
    PORTFOLIO_COMPANIES.length
  ).toFixed(1);
  const totalAlerts = PORTFOLIO_COMPANIES.reduce((sum, c) => sum + c.alerts, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pt-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-1">Portfolio Dashboard</h1>
        <p className="text-slate-400">
          Group-level view of all {PORTFOLIO_COMPANIES.length} companies
        </p>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`R ${(totalRevenue / 1000000).toFixed(1)}M`}
          change={5.2}
          trend="up"
        />
        <MetricCard
          title="Combined Cash"
          value={`R ${(totalCashPosition / 1000).toFixed(0)}K`}
          change={8.5}
          trend="up"
        />
        <MetricCard
          title="Avg Profitability"
          value={`${avgProfitability}%`}
          change={1.2}
          trend="up"
        />
        <MetricCard
          title="Needs Attention"
          value={totalAlerts.toString()}
          subtitleColor="text-amber-400"
        />
      </div>

      {/* Revenue Comparison Chart */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Revenue Comparison (12 Months)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={PORTFOLIO_REVENUE_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d27',
                border: '1px solid #475569',
              }}
            />
            <Legend />
            {PORTFOLIO_COMPANIES.map((company, idx) => (
              <Line
                key={company.id}
                type="monotone"
                dataKey={company.name}
                stroke={COLORS[idx]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Profitability Heatmap */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Profitability Heatmap (Monthly %)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">
                  Company
                </th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">
                  Jan
                </th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">
                  Feb
                </th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">
                  Mar
                </th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">
                  Apr
                </th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">
                  May
                </th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">
                  Jun
                </th>
              </tr>
            </thead>
            <tbody>
              {PORTFOLIO_COMPANIES.map((company) => (
                <tr key={company.id} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 text-slate-100 font-medium">
                    {company.name}
                  </td>
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const margin =
                      company.profitability +
                      (Math.random() - 0.5) * 4 +
                      (idx < 3 ? 1 : -1);
                    const hue = margin > 60 ? 120 : margin > 50 ? 45 : 0;
                    return (
                      <td key={idx} className="px-4 py-3 text-center">
                        <div
                          style={{
                            backgroundColor: `hsl(${hue}, 80%, 40%)`,
                          }}
                          className="py-2 px-3 rounded font-medium text-white text-xs inline-block"
                        >
                          {margin.toFixed(0)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Company Cards Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Company Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PORTFOLIO_COMPANIES.map((company) => (
            <Card
              key={company.id}
              className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer hover:bg-slate-800/70"
              onClick={() => switchCompany(company.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-100">
                  {company.name}
                </h3>
                <HealthBadge score={company.healthScore} />
              </div>

              {/* Alerts */}
              {company.alerts > 0 && (
                <div className="mb-3 flex items-center gap-2 text-sm text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{company.alerts} alert{company.alerts > 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Revenue Sparkline */}
              <div className="mb-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Revenue</span>
                  <span className="text-lg font-semibold text-slate-100">
                    R {(company.revenue / 1000000).toFixed(1)}M
                  </span>
                </div>
                <Sparkline
                  data={company.revenueSparkline}
                  height={30}
                  color="#2563EB"
                />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Profitability</div>
                  <div className="text-lg font-semibold text-green-400">
                    {company.profitability.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Cash Position</div>
                  <div className="text-lg font-semibold text-slate-100">
                    R {(company.cashPosition / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-300 gap-2"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Needs Attention */}
      {NEEDS_ATTENTION.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">Needs Attention</h2>
          <div className="space-y-2">
            {NEEDS_ATTENTION.map((item) => (
              <Card
                key={item.id}
                className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="font-semibold text-slate-100">
                        {item.company}
                      </h4>
                      <p className="text-sm text-slate-400">{item.issue}</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      item.severity === 'HIGH'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }
                  >
                    {item.severity}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Group Forecast */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Group Forecast (Next 3 Months)
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
            <span className="text-slate-300">Combined Revenue Projection</span>
            <span className="font-semibold text-green-400">
              +R 2.8M (+4.2%)
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
            <span className="text-slate-300">Cash Position Trend</span>
            <span className="font-semibold text-green-400">Improving</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
            <span className="text-slate-300">
              Companies on Track
            </span>
            <span className="font-semibold text-slate-100">3/5</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
