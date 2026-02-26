'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

// CMO Function Categories and Functions
const CMO_CATEGORIES = [
  {
    id: 'advertising',
    name: 'Advertising & Paid Media',
    description: 'Optimize your paid advertising campaigns',
    functions: [
      {
        slug: 'google-ads-audit',
        name: 'Google Ads Audit',
        description: 'Comprehensive analysis of your Google Ads campaigns',
        icon: '📊',
        isNew: false,
      },
      {
        slug: 'facebook-ads-audit',
        name: 'Facebook Ads Audit',
        description: 'Performance review and optimization recommendations',
        icon: '👥',
        isNew: false,
      },
      {
        slug: 'tiktok-ads',
        name: 'TikTok Ads Strategy',
        description: 'Develop and optimize TikTok advertising strategy',
        icon: '🎵',
        isNew: true,
      },
      {
        slug: 'linkedin-ads',
        name: 'LinkedIn Ads Audit',
        description: 'B2B advertising performance analysis',
        icon: '💼',
        isNew: false,
      },
      {
        slug: 'marketplace-ads',
        name: 'Marketplace Ads Review',
        description: 'Takealot and Amazon advertising optimization',
        icon: '🛒',
        isNew: false,
      },
      {
        slug: 'budget-allocator',
        name: 'Budget Allocator',
        description: 'Optimal channel budget distribution',
        icon: '💰',
        isNew: false,
      },
      {
        slug: 'ad-creative-review',
        name: 'Ad Creative Review',
        description: 'Analyze and improve ad creatives',
        icon: '🎨',
        isNew: false,
      },
      {
        slug: 'audience-strategy',
        name: 'Audience Strategy',
        description: 'Define and refine target audiences',
        icon: '🎯',
        isNew: false,
      },
      {
        slug: 'retargeting-strategy',
        name: 'Retargeting Strategy',
        description: 'Re-engage interested prospects',
        icon: '🔁',
        isNew: false,
      },
      {
        slug: 'attribution-modelling',
        name: 'Attribution Modelling',
        description: 'Understand multi-touch attribution',
        icon: '📈',
        isNew: false,
      },
    ],
  },
  {
    id: 'seo',
    name: 'SEO & Organic',
    description: 'Improve your search visibility',
    functions: [
      {
        slug: 'seo-audit',
        name: 'SEO Audit',
        description: 'Technical and on-page SEO review',
        icon: '🔍',
        isNew: false,
      },
      {
        slug: 'keyword-research',
        name: 'Keyword Research',
        description: 'Identify high-value keywords',
        icon: '🔑',
        isNew: false,
      },
      {
        slug: 'content-brief-generator',
        name: 'Content Brief Generator',
        description: 'Create data-driven content briefs',
        icon: '📝',
        isNew: false,
      },
      {
        slug: 'on-page-seo',
        name: 'On-Page SEO',
        description: 'Optimize individual pages',
        icon: '📄',
        isNew: false,
      },
      {
        slug: 'local-seo',
        name: 'Local SEO',
        description: 'Improve local search visibility',
        icon: '📍',
        isNew: false,
      },
      {
        slug: 'technical-seo',
        name: 'Technical SEO',
        description: 'Fix technical issues',
        icon: '⚙️',
        isNew: false,
      },
    ],
  },
  {
    id: 'content',
    name: 'Content & Social',
    description: 'Create and distribute content',
    functions: [
      {
        slug: 'content-strategy',
        name: 'Content Strategy',
        description: 'Develop comprehensive content strategy',
        icon: '📚',
        isNew: false,
      },
      {
        slug: 'social-media-strategy',
        name: 'Social Media Strategy',
        description: 'Plan social media approach',
        icon: '📱',
        isNew: false,
      },
      {
        slug: 'social-media-calendar',
        name: 'Social Media Calendar',
        description: 'Generate content calendar',
        icon: '📅',
        isNew: false,
      },
      {
        slug: 'email-marketing-audit',
        name: 'Email Marketing Audit',
        description: 'Review email campaigns',
        icon: '✉️',
        isNew: false,
      },
      {
        slug: 'email-sequence-builder',
        name: 'Email Sequence Builder',
        description: 'Design email workflows',
        icon: '🔄',
        isNew: false,
      },
      {
        slug: 'video-marketing',
        name: 'Video Marketing Strategy',
        description: 'Plan video content strategy',
        icon: '🎬',
        isNew: true,
      },
    ],
  },
  {
    id: 'brand',
    name: 'Brand & Strategy',
    description: 'Shape your brand identity',
    functions: [
      {
        slug: 'brand-strategy',
        name: 'Brand Strategy',
        description: 'Develop brand positioning',
        icon: '🏷️',
        isNew: false,
      },
      {
        slug: 'competitor-analysis',
        name: 'Competitor Analysis',
        description: 'Analyze competitive landscape',
        icon: '⚔️',
        isNew: false,
      },
      {
        slug: 'go-to-market',
        name: 'Go-to-Market Strategy',
        description: 'Plan market entry strategy',
        icon: '🚀',
        isNew: false,
      },
      {
        slug: 'customer-journey',
        name: 'Customer Journey',
        description: 'Map customer touchpoints',
        icon: '🛤️',
        isNew: false,
      },
      {
        slug: 'channel-assessment',
        name: 'Channel Assessment',
        description: 'Evaluate marketing channels',
        icon: '📡',
        isNew: false,
      },
      {
        slug: 'pricing-promotion',
        name: 'Pricing & Promotion',
        description: 'Optimize pricing strategy',
        icon: '🏷️',
        isNew: false,
      },
      {
        slug: 'partnership-strategy',
        name: 'Partnership Strategy',
        description: 'Identify partnership opportunities',
        icon: '🤝',
        isNew: false,
      },
      {
        slug: 'referral-programme',
        name: 'Referral Programme',
        description: 'Design referral mechanics',
        icon: '👥',
        isNew: true,
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics & Reporting',
    description: 'Measure and report results',
    functions: [
      {
        slug: 'kpi-dashboard-setup',
        name: 'KPI Dashboard Setup',
        description: 'Configure marketing dashboards',
        icon: '📊',
        isNew: false,
      },
      {
        slug: 'full-funnel-analysis',
        name: 'Full Funnel Analysis',
        description: 'Analyze conversion funnel',
        icon: '🔱',
        isNew: false,
      },
      {
        slug: 'customer-lifetime-value',
        name: 'Customer Lifetime Value',
        description: 'Calculate and optimize CLV',
        icon: '💎',
        isNew: false,
      },
      {
        slug: 'cohort-analysis',
        name: 'Cohort Analysis',
        description: 'Track customer cohorts',
        icon: '📊',
        isNew: false,
      },
      {
        slug: 'marketing-roi-report',
        name: 'Marketing ROI Report',
        description: 'Measure marketing ROI',
        icon: '📈',
        isNew: false,
      },
      {
        slug: 'competitive-benchmarking',
        name: 'Competitive Benchmarking',
        description: 'Benchmark against competitors',
        icon: '🎯',
        isNew: false,
      },
    ],
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Optimize marketplace presence',
    functions: [
      {
        slug: 'takealot-listing',
        name: 'Takealot Listing Optimization',
        description: 'Improve Takealot product listings',
        icon: '🛍️',
        isNew: false,
      },
      {
        slug: 'amazon-listing',
        name: 'Amazon Listing Optimization',
        description: 'Optimize Amazon product listings',
        icon: '📦',
        isNew: false,
      },
      {
        slug: 'marketplace-pricing',
        name: 'Marketplace Pricing',
        description: 'Dynamic pricing strategy',
        icon: '💲',
        isNew: false,
      },
      {
        slug: 'multi-channel-strategy',
        name: 'Multi-Channel Strategy',
        description: 'Coordinate across marketplaces',
        icon: '🌐',
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

export default function CMOPage() {
  const [recentAnalyses] = useState<RecentAnalysis[]>([
    {
      id: '1',
      functionName: 'Google Ads Audit',
      date: '2 days ago',
      status: 'completed',
    },
    {
      id: '2',
      functionName: 'Social Media Strategy',
      date: '5 days ago',
      status: 'completed',
    },
    {
      id: '3',
      functionName: 'Competitor Analysis',
      date: '1 week ago',
      status: 'completed',
    },
    {
      id: '4',
      functionName: 'SEO Audit',
      date: '2 weeks ago',
      status: 'completed',
    },
    {
      id: '5',
      functionName: 'Content Strategy',
      date: '3 weeks ago',
      status: 'completed',
    },
  ]);

  const totalAnalyses = recentAnalyses.length;
  const lastAnalysisDate = recentAnalyses[0]?.date || 'Never';
  const activeTasks = 12;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">CMO Module</h1>
        <p className="text-muted-foreground mt-2">
          Run analyses on your marketing functions and get AI-powered recommendations
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

      {/* Functions by Category */}
      {CMO_CATEGORIES.map((category) => (
        <div key={category.id} className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
            <p className="text-muted-foreground mt-1">{category.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.functions.map((func) => (
              <Link key={func.slug} href={`/cmo/${func.slug}`}>
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
