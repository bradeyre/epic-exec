'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Zap,
  Filter,
  Search,
  MoreVertical,
  ChevronDown,
  Eye,
  Copy,
  Archive,
  TrendingUp,
  Star,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock prompts data
const MOCK_PROMPTS = [
  {
    id: '1',
    title: 'Cash Flow Analysis',
    module: 'CFO',
    function: 'cash_flow_analysis',
    version: '3',
    status: 'ACTIVE',
    tags: ['financial', 'analysis', 'cash'],
    usageCount: 1240,
    satisfaction: 4.8,
    lastUpdated: new Date(Date.now() - 432000000),
  },
  {
    id: '2',
    title: 'Campaign Performance',
    module: 'CMO',
    function: 'campaign_performance',
    version: '2',
    status: 'ACTIVE',
    tags: ['marketing', 'campaigns', 'analytics'],
    usageCount: 856,
    satisfaction: 4.6,
    lastUpdated: new Date(Date.now() - 604800000),
  },
  {
    id: '3',
    title: 'Revenue Forecast',
    module: 'CFO',
    function: 'revenue_forecast',
    version: '4',
    status: 'ACTIVE',
    tags: ['financial', 'forecast', 'revenue'],
    usageCount: 1050,
    satisfaction: 4.7,
    lastUpdated: new Date(Date.now() - 259200000),
  },
  {
    id: '4',
    title: 'Brand Audit',
    module: 'CMO',
    function: 'brand_audit',
    version: '2',
    status: 'ACTIVE',
    tags: ['brand', 'strategy', 'cmo'],
    usageCount: 342,
    satisfaction: 4.5,
    lastUpdated: new Date(Date.now() - 1209600000),
  },
  {
    id: '5',
    title: 'Margin Analysis Experimental',
    module: 'CFO',
    function: 'margin_analysis',
    version: '5beta',
    status: 'DRAFT',
    tags: ['financial', 'margin', 'experimental'],
    usageCount: 45,
    satisfaction: 4.3,
    lastUpdated: new Date(Date.now() - 86400000),
  },
  {
    id: '6',
    title: 'Market Positioning (Archived)',
    module: 'CMO',
    function: 'market_positioning',
    version: '1',
    status: 'ARCHIVED',
    tags: ['marketing', 'strategy', 'legacy'],
    usageCount: 521,
    satisfaction: 4.2,
    lastUpdated: new Date(Date.now() - 2592000000),
  },
];

const PROMPT_VARIABLES = [
  { name: 'company_name', type: 'string', description: 'Name of the company' },
  { name: 'period', type: 'string', description: 'Analysis period (e.g., "Q1 2025")' },
  { name: 'data_points', type: 'json', description: 'Historical financial data' },
  { name: 'target_metrics', type: 'json', description: 'Target values for key metrics' },
];

const PROMPT_VERSIONS = [
  {
    version: '3',
    date: new Date(Date.now() - 432000000),
    status: 'ACTIVE',
    changelog: 'Added working capital analysis, improved cash flow predictions',
  },
  {
    version: '2',
    date: new Date(Date.now() - 2592000000),
    status: 'DEPRECATED',
    changelog: 'Initial version with basic cash flow metrics',
  },
];

const getStatusColor = (status: string) => {
  const colors = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    DRAFT: 'bg-amber-500/20 text-amber-400',
    ARCHIVED: 'bg-gray-500/20 text-gray-400',
  };
  return colors[status as keyof typeof colors] || colors.ACTIVE;
};

interface Prompt {
  id: string;
  title: string;
  module: string;
  function: string;
  version: string;
  status: string;
  tags: string[];
  usageCount: number;
  satisfaction: number;
  lastUpdated: Date;
}

interface DetailView {
  prompt: Prompt;
  activeTab: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState(MOCK_PROMPTS);
  const [detailView, setDetailView] = useState<DetailView | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handlePromptClick = (prompt: Prompt) => {
    setDetailView({ prompt, activeTab: 'editor' });
  };

  const handleCloseDetail = () => {
    setDetailView(null);
  };

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.function.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = filterModule === 'all' || p.module === filterModule;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesModule && matchesStatus;
  });

  if (detailView) {
    const { prompt, activeTab } = detailView;

    return (
      <div className="space-y-6 pb-12">
        {/* Detail Header */}
        <div className="flex items-center justify-between pt-6">
          <button
            onClick={handleCloseDetail}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <div className="flex-1 ml-4">
            <h1 className="text-3xl font-bold text-slate-100">{prompt.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="secondary">{prompt.module}</Badge>
              <Badge className={getStatusColor(prompt.status)}>
                {prompt.status}
              </Badge>
              <Badge variant="outline" className="border-slate-700">
                v{prompt.version}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          {['editor', 'variables', 'versions', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailView({ ...detailView, activeTab: tab })}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab
                  ? 'text-blue-400 border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300',
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'editor' && (
            <div className="space-y-6">
              <Card className="p-6 bg-slate-800/50 border-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">
                  System Prompt
                </h2>
                <textarea
                  readOnly
                  rows={8}
                  value={`You are a financial analysis expert specializing in cash flow management. Analyze the provided financial data and generate actionable recommendations.

Focus on:
- Cash position trends and forecasting
- Working capital optimization
- Liquidity risks and mitigation strategies
- Cash runway projections

Provide analysis in a professional, executive-friendly format with clear metrics and actionable recommendations.`}
                  className="w-full bg-slate-700/50 border border-slate-700 text-slate-100 rounded-lg p-3 font-mono text-sm resize-none"
                />
                <Button variant="outline" className="mt-4 border-slate-700">
                  Edit
                </Button>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">
                  User Prompt Template
                </h2>
                <textarea
                  readOnly
                  rows={6}
                  value={`Analyze the cash flow for {{company_name}} for {{period}}.

Data points:
{{data_points}}

Target metrics:
{{target_metrics}}

Provide a comprehensive analysis including:
1. Current cash position and trends
2. Working capital assessment
3. Cash runway forecast
4. Key risks and recommendations`}
                  className="w-full bg-slate-700/50 border border-slate-700 text-slate-100 rounded-lg p-3 font-mono text-sm resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Variables in double braces will be replaced at runtime
                </p>
                <Button variant="outline" className="mt-4 border-slate-700">
                  Edit
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'variables' && (
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                Variables
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-slate-400 font-medium">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROMPT_VARIABLES.map((variable) => (
                      <tr
                        key={variable.name}
                        className="border-b border-slate-700/50"
                      >
                        <td className="px-4 py-3 text-slate-100 font-mono">
                          {variable.name}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <Badge variant="secondary" className="text-xs">
                            {variable.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {variable.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'versions' && (
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                Version History
              </h2>
              <div className="space-y-3">
                {PROMPT_VERSIONS.map((v) => (
                  <div
                    key={v.version}
                    className="p-4 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-100">
                          Version {v.version}
                        </span>
                        <Badge
                          className={
                            v.status === 'ACTIVE'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }
                        >
                          {v.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-500">
                        {format(v.date, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{v.changelog}</p>
                    {v.status !== 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-slate-700 text-slate-300"
                      >
                        Promote to Active
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 bg-slate-800/50 border-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">
                  Usage Statistics
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Total Uses</div>
                    <div className="text-3xl font-bold text-slate-100">
                      {prompt.usageCount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">
                      Average Satisfaction
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-yellow-400">
                        {prompt.satisfaction.toFixed(1)}
                      </div>
                      <span className="text-sm text-slate-500">/5.0</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">
                  Performance
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Success Rate</span>
                    <span className="font-semibold text-green-400">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Avg Response Time</span>
                    <span className="font-semibold text-slate-100">2.3s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Token Usage</span>
                    <span className="font-semibold text-slate-100">~850</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-6">
        <h1 className="text-3xl font-bold text-slate-100">Prompt Studio</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Prompt
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
          />
        </div>
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 text-sm"
        >
          <option value="all">All Modules</option>
          <option value="CMO">CMO</option>
          <option value="CFO">CFO</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 text-sm"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPrompts.map((prompt) => (
          <Card
            key={prompt.id}
            className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer"
            onClick={() => handlePromptClick(prompt)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    {prompt.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {prompt.module}
                  </Badge>
                  <Badge className={getStatusColor(prompt.status)}>
                    {prompt.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mb-3">{prompt.function}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-500">
                    v{prompt.version} • Updated {format(prompt.lastUpdated, 'MMM d')}
                  </span>
                  <div className="flex gap-2">
                    {prompt.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-slate-700 text-slate-400 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ml-4 flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-sm text-slate-400">Satisfaction</div>
                  <div className="font-semibold text-yellow-400">
                    {prompt.satisfaction.toFixed(1)}★
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Usage</div>
                  <div className="font-semibold text-slate-100">
                    {prompt.usageCount}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
