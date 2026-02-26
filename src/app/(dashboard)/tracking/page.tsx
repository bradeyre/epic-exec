'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ChevronDown } from 'lucide-react';

// Mock financial data
const FINANCIAL_DATA_12M = [
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

// Mock marketing data
const MARKETING_DATA = [
  { month: 'Jan', adSpend: 35000, revenue: 185000, roas: 5.3 },
  { month: 'Feb', adSpend: 38000, revenue: 192000, roas: 5.05 },
  { month: 'Mar', adSpend: 42000, revenue: 198500, roas: 4.73 },
  { month: 'Apr', adSpend: 45000, revenue: 205000, roas: 4.56 },
  { month: 'May', adSpend: 40000, revenue: 198000, roas: 4.95 },
  { month: 'Jun', adSpend: 48000, revenue: 210000, roas: 4.38 },
  { month: 'Jul', adSpend: 50000, revenue: 215000, roas: 4.3 },
  { month: 'Aug', adSpend: 46000, revenue: 208000, roas: 4.52 },
  { month: 'Sep', adSpend: 52000, revenue: 220000, roas: 4.23 },
  { month: 'Oct', adSpend: 55000, revenue: 225000, roas: 4.09 },
  { month: 'Nov', adSpend: 58000, revenue: 235000, roas: 4.05 },
  { month: 'Dec', adSpend: 62000, revenue: 245000, roas: 3.95 },
];

const ROAS_BY_CHANNEL = [
  { channel: 'Google Ads', roas: 3.85, spend: 125000 },
  { channel: 'Facebook', roas: 2.42, spend: 85000 },
  { channel: 'TikTok', roas: 1.85, spend: 45000 },
  { channel: 'LinkedIn', roas: 2.15, spend: 32000 },
];

const CAC_DATA = [
  { month: 'Jan', cac: 185, target: 200 },
  { month: 'Feb', cac: 198, target: 200 },
  { month: 'Mar', cac: 210, target: 200 },
  { month: 'Apr', cac: 220, target: 200 },
  { month: 'May', cac: 205, target: 200 },
  { month: 'Jun', cac: 195, target: 200 },
  { month: 'Jul', cac: 186, target: 200 },
  { month: 'Aug', cac: 192, target: 200 },
  { month: 'Sep', cac: 188, target: 200 },
  { month: 'Oct', cac: 180, target: 200 },
  { month: 'Nov', cac: 175, target: 200 },
  { month: 'Dec', cac: 170, target: 200 },
];

const FUNNEL_DATA = [
  { stage: 'Impressions', value: 2850000 },
  { stage: 'Clicks', value: 142500 },
  { stage: 'Conversions', value: 14250 },
  { stage: 'Revenue', value: 245000 },
];

const PORTFOLIO_DATA = [
  {
    name: 'Epic Deals',
    revenue: 2450000,
    profitability: 62.8,
    healthScore: 'GREEN',
  },
  {
    name: 'Platinum Repairs',
    revenue: 1850000,
    profitability: 55.2,
    healthScore: 'AMBER',
  },
  {
    name: 'Everyday Adventure',
    revenue: 1620000,
    profitability: 58.5,
    healthScore: 'GREEN',
  },
  {
    name: 'The Automators',
    revenue: 980000,
    profitability: 48.3,
    healthScore: 'AMBER',
  },
  {
    name: 'Epic Rentals',
    revenue: 1240000,
    profitability: 52.1,
    healthScore: 'AMBER',
  },
];

const PORTFOLIO_REVENUE_DATA = [
  {
    month: 'Jan',
    'Epic Deals': 185000,
    'Platinum Repairs': 145000,
    'Everyday Adventure': 128000,
    'The Automators': 75000,
    'Epic Rentals': 95000,
  },
  {
    month: 'Feb',
    'Epic Deals': 192000,
    'Platinum Repairs': 148000,
    'Everyday Adventure': 130000,
    'The Automators': 78000,
    'Epic Rentals': 98000,
  },
  {
    month: 'Mar',
    'Epic Deals': 198500,
    'Platinum Repairs': 152000,
    'Everyday Adventure': 135000,
    'The Automators': 81000,
    'Epic Rentals': 102000,
  },
  {
    month: 'Apr',
    'Epic Deals': 205000,
    'Platinum Repairs': 155000,
    'Everyday Adventure': 138000,
    'The Automators': 84000,
    'Epic Rentals': 105000,
  },
  {
    month: 'May',
    'Epic Deals': 198000,
    'Platinum Repairs': 152000,
    'Everyday Adventure': 135000,
    'The Automators': 81000,
    'Epic Rentals': 102000,
  },
  {
    month: 'Jun',
    'Epic Deals': 210000,
    'Platinum Repairs': 160000,
    'Everyday Adventure': 140000,
    'The Automators': 88000,
    'Epic Rentals': 110000,
  },
];

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];

const FinancialTab = ({ period }: { period: string }) => {
  const data =
    period === '12m' ? FINANCIAL_DATA_12M : FINANCIAL_DATA_12M.slice(-6);

  return (
    <div className="space-y-6">
      {/* Revenue & Forecast */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Revenue Trend & Forecast
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d27',
                border: '1px solid #475569',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563EB"
              strokeWidth={2}
              dot={false}
              name="Revenue (ZAR)"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              fill="#2563EB"
              stroke="none"
              fillOpacity={0.1}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* Margin & Operating Expense */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Gross Margin %
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1d27',
                  border: '1px solid #475569',
                }}
              />
              <Line
                type="monotone"
                dataKey="margin"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="margin"
                stroke="#10B981"
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Operating Expenses % of Revenue
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1d27',
                  border: '1px solid #475569',
                }}
              />
              <Bar dataKey="opex" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Cash Position */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Cash Position Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d27',
                border: '1px solid #475569',
              }}
            />
            <Area
              type="monotone"
              dataKey="cash"
              stroke="#2563EB"
              fillOpacity={1}
              fill="url(#colorCash)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Revenue"
          value="R 245K"
          subtitle="Last month"
          change={4.3}
          trend="up"
        />
        <MetricCard
          title="Gross Margin"
          value="62.8%"
          change={1.8}
          trend="up"
        />
        <MetricCard
          title="Net Margin"
          value="28.5%"
          change={2.1}
          trend="up"
        />
        <MetricCard
          title="Cash Runway"
          value="8.2 months"
          change={-1.2}
          trend="down"
        />
      </div>
    </div>
  );
};

const MarketingTab = () => {
  return (
    <div className="space-y-6">
      {/* Ad Spend vs Revenue */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Ad Spend vs Revenue
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={MARKETING_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d27',
                border: '1px solid #475569',
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="adSpend" fill="#F59E0B" name="Ad Spend" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#2563EB"
              strokeWidth={2}
              name="Revenue"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* ROAS by Channel */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            ROAS by Channel
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ROAS_BY_CHANNEL}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis
                dataKey="channel"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1d27',
                  border: '1px solid #475569',
                }}
              />
              <Bar dataKey="roas" fill="#10B981" name="ROAS" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            CAC Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={CAC_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1d27',
                  border: '1px solid #475569',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cac"
                stroke="#2563EB"
                strokeWidth={2}
                name="CAC"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#94A3B8"
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Marketing Funnel */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Marketing Funnel
        </h3>
        <div className="space-y-3">
          {FUNNEL_DATA.map((item, idx) => {
            const width = (item.value / FUNNEL_DATA[0].value) * 100;
            return (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-300">{item.stage}</span>
                  <span className="text-sm font-medium text-slate-100">
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-8 overflow-hidden">
                  <div
                    style={{ width: `${width}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-3"
                  >
                    <span className="text-xs font-semibold text-white">
                      {width.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Channel Performance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Google Ads ROAS"
          value="3.85x"
          change={-2.1}
          trend="down"
        />
        <MetricCard
          title="Facebook ROAS"
          value="2.42x"
          change={1.5}
          trend="up"
        />
        <MetricCard
          title="TikTok ROAS"
          value="1.85x"
          change={-0.8}
          trend="down"
        />
        <MetricCard
          title="Total Ad Spend"
          value="R 62K"
          subtitle="This month"
          change={6.8}
          trend="up"
        />
      </div>
    </div>
  );
};

const PortfolioTab = () => {
  return (
    <div className="space-y-6">
      {/* Portfolio Revenue */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Company Revenue Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={PORTFOLIO_REVENUE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d27',
                border: '1px solid #475569',
              }}
            />
            <Legend />
            {PORTFOLIO_DATA.map((company, idx) => (
              <Line
                key={company.name}
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
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Profitability Heatmap
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-2 text-left text-slate-400 font-medium">
                  Company
                </th>
                {PORTFOLIO_REVENUE_DATA.map((item) => (
                  <th
                    key={item.month}
                    className="px-4 py-2 text-center text-slate-400 font-medium"
                  >
                    {item.month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PORTFOLIO_DATA.map((company) => (
                <tr key={company.name} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 text-slate-100 font-medium">
                    {company.name}
                  </td>
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const margin =
                      50 + Math.random() * 15 + (idx < 3 ? 2 : -2);
                    const hue = margin > 60 ? 120 : margin > 50 ? 45 : 0;
                    return (
                      <td key={idx} className="px-4 py-3 text-center">
                        <div
                          style={{
                            backgroundColor: `hsl(${hue}, 80%, 40%)`,
                          }}
                          className="py-2 px-3 rounded font-medium text-white text-xs"
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

      {/* Company Cards */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Company Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PORTFOLIO_DATA.map((company) => (
            <Card
              key={company.name}
              className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-slate-100">{company.name}</h4>
                <Badge
                  variant={
                    company.healthScore === 'GREEN' ? 'default' : 'secondary'
                  }
                  className={
                    company.healthScore === 'GREEN'
                      ? 'bg-green-500/20 text-green-400'
                      : company.healthScore === 'AMBER'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                  }
                >
                  {company.healthScore}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Revenue</div>
                  <div className="text-lg font-semibold text-slate-100">
                    R {(company.revenue / 1000000).toFixed(1)}M
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Profitability</div>
                  <div className="text-lg font-semibold text-green-400">
                    {company.profitability.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState('financial');
  const [period, setPeriod] = useState('12m');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-6">
        <h1 className="text-3xl font-bold text-slate-100">Tracking Dashboards</h1>
        {activeTab === 'financial' && (
          <div className="flex gap-2">
            <Button
              variant={period === '6m' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('6m')}
              className={period === '6m' ? '' : 'border-slate-700 text-slate-300'}
            >
              6M
            </Button>
            <Button
              variant={period === '12m' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('12m')}
              className={period === '12m' ? '' : 'border-slate-700 text-slate-300'}
            >
              12M
            </Button>
            <Button
              variant={period === '24m' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('24m')}
              className={period === '24m' ? '' : 'border-slate-700 text-slate-300'}
            >
              24M
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {['financial', 'marketing', 'portfolio'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'text-blue-400 border-blue-500'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'financial' && <FinancialTab period={period} />}
        {activeTab === 'marketing' && <MarketingTab />}
        {activeTab === 'portfolio' && <PortfolioTab />}
      </div>
    </div>
  );
}
