'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Edit,
  Check,
  Send,
  MoreVertical,
  Eye,
  Download,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Mock data
const MOCK_NEWSLETTERS = [
  {
    id: '1',
    title: 'Weekly Marketing Digest - Feb 10',
    status: 'SENT',
    created: new Date(Date.now() - 604800000),
    scheduled: new Date(Date.now() - 604800000),
    preview: "This week's highlights: Google Ads ROAS increased to 3.85x...",
  },
  {
    id: '2',
    title: 'February Financial Review',
    status: 'APPROVED',
    created: new Date(Date.now() - 432000000),
    scheduled: new Date(Date.now() + 259200000),
    preview: 'Revenue exceeded target by 4.2%. Gross margin improved to 62.8%...',
  },
  {
    id: '3',
    title: 'Q1 Strategic Update',
    status: 'REVIEW',
    created: new Date(Date.now() - 259200000),
    scheduled: new Date(Date.now() + 604800000),
    preview: 'Q1 performance summary and strategic priorities for Q2...',
  },
  {
    id: '4',
    title: 'Marketing Channel Analysis',
    status: 'DRAFT',
    created: new Date(Date.now() - 172800000),
    scheduled: null,
    preview: 'Comprehensive analysis of Facebook, Google, and TikTok performance...',
  },
  {
    id: '5',
    title: 'Customer Insights Report',
    status: 'DRAFT',
    created: new Date(Date.now() - 86400000),
    scheduled: null,
    preview: 'Key findings from customer sentiment analysis and feedback...',
  },
];

const SCHEDULE_TEMPLATES = [
  { name: 'Weekly Digest', frequency: 'Every Monday at 8:00 AM' },
  { name: 'Fortnightly', frequency: 'Every 2 weeks on Friday' },
  { name: 'Monthly', frequency: 'First Monday of each month' },
  { name: 'Event-Triggered', frequency: 'When health scores change' },
  { name: 'Custom', frequency: 'Define your own schedule' },
];

const getStatusColor = (status: string) => {
  const colors = {
    DRAFT: 'bg-slate-500/20 text-slate-300',
    REVIEW: 'bg-amber-500/20 text-amber-400',
    APPROVED: 'bg-green-500/20 text-green-400',
    SENT: 'bg-blue-500/20 text-blue-400',
  };
  return colors[status as keyof typeof colors] || colors.DRAFT;
};

interface NewsletterDraft {
  id: string;
  title: string;
  status: string;
  created: Date;
  scheduled: Date | null;
  preview: string;
}

interface DetailView {
  newsletter: NewsletterDraft;
  selectedSubject?: number;
}

export default function NewslettersPage() {
  const [drafts, setDrafts] = useState(MOCK_NEWSLETTERS);
  const [detailView, setDetailView] = useState<DetailView | null>(null);
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const handleDraftClick = (draft: NewsletterDraft) => {
    setDetailView({ newsletter: draft, selectedSubject: 0 });
  };

  const handleCloseDetail = () => {
    setDetailView(null);
  };

  const subjectLines = [
    'Weekly Marketing & Finance Digest - Your Performance Snapshot',
    'February Performance Review - Revenue Up 4.2%',
    'Action Items: 3 Quick Wins to Boost Your Metrics',
  ];

  if (detailView) {
    return (
      <div className="pb-12">
        {/* Detail Header */}
        <div className="flex items-center justify-between pt-6 mb-6">
          <button
            onClick={handleCloseDetail}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 ml-4">
            <h1 className="text-3xl font-bold text-slate-100">
              {detailView.newsletter.title}
            </h1>
            <p className="text-slate-400 mt-1">
              Created {format(detailView.newsletter.created, 'MMM d')}
            </p>
          </div>
          <Badge className={getStatusColor(detailView.newsletter.status)}>
            {detailView.newsletter.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Subject Line Selection */}
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                Subject Line Options
              </h2>
              <div className="space-y-3">
                {subjectLines.map((subject, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-all',
                      selectedSubject === idx
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600',
                    )}
                    onClick={() => setSelectedSubject(idx)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        checked={selectedSubject === idx}
                        onChange={() => setSelectedSubject(idx)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-slate-100">{subject}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {subject.length} characters
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Preview Text */}
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                Preview Text
              </h2>
              <Input
                value={detailView.newsletter.preview}
                readOnly
                className="bg-slate-700/50 border-slate-700 text-slate-100"
              />
              <p className="text-xs text-slate-500 mt-2">
                This text appears in email clients as a preview
              </p>
            </Card>

            {/* Email Body */}
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                Email Body
              </h2>
              <div className="space-y-4 text-slate-300 max-h-96 overflow-y-auto">
                <p>
                  Hello Brad,
                </p>
                <p>
                  Here's your weekly digest of key metrics and actionable insights:
                </p>
                <div className="bg-slate-700/30 p-4 rounded space-y-3">
                  <div className="flex justify-between">
                    <span>Revenue MTD:</span>
                    <span className="font-semibold text-green-400">
                      R 156.3K (+4.2%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Margin:</span>
                    <span className="font-semibold text-green-400">62.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Google Ads ROAS:</span>
                    <span className="font-semibold text-amber-400">3.85x (-2.1%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Tasks:</span>
                    <span className="font-semibold text-slate-100">24</span>
                  </div>
                </div>
                <p>
                  Key recommendations for this week: Review Google Ads bid strategy, approve supplier contract review, and schedule content calendar planning.
                </p>
                <p>
                  Best regards,
                  <br />
                  Virtual Executive AI
                </p>
              </div>
            </Card>

            {/* Content Sources */}
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-100 mb-4">
                Content Sources Used
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300">Cash Flow Analysis (CFO)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300">Campaign Performance (CMO)</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300">Margin Analysis (CFO)</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions */}
            <Card className="p-4 bg-slate-800/50 border-slate-700/50 space-y-2">
              <Button
                variant="outline"
                className="w-full gap-2 border-slate-700 text-slate-300"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              {detailView.newsletter.status !== 'SENT' && (
                <>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button className="w-full gap-2 bg-green-500 hover:bg-green-600">
                    <Send className="w-4 h-4" />
                    Schedule
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="w-full gap-2 border-slate-700 text-slate-300"
              >
                <Download className="w-4 h-4" />
                Export HTML
              </Button>
            </Card>

            {/* Schedule Info */}
            {detailView.newsletter.scheduled && (
              <Card className="p-4 bg-slate-800/50 border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-100 mb-2">
                  Scheduled
                </h3>
                <p className="text-sm text-slate-400">
                  {format(detailView.newsletter.scheduled, 'MMMM d, yyyy')}
                </p>
              </Card>
            )}

            {/* AI Suggestions */}
            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <h3 className="text-sm font-semibold text-blue-400 mb-3">
                AI Suggestions
              </h3>
              <ul className="space-y-2 text-xs text-blue-300">
                <li>• Add metric trending chart</li>
                <li>• Highlight 3 key actions</li>
                <li>• Include call-to-action button</li>
              </ul>
            </Card>

            {/* Brand Voice */}
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-100 mb-3">
                Brand Voice Profile
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Tone:</span>
                  <span className="text-slate-300 ml-2">Professional, Data-driven</span>
                </div>
                <div>
                  <span className="text-slate-400">Formality:</span>
                  <span className="text-slate-300 ml-2">High</span>
                </div>
                <div>
                  <span className="text-slate-400">Audience:</span>
                  <span className="text-slate-300 ml-2">Executive leadership</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-6">
        <h1 className="text-3xl font-bold text-slate-100">Newsletters</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Newsletter
        </Button>
      </div>

      {/* Schedule Templates */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Schedule Templates</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {SCHEDULE_TEMPLATES.map((template) => (
            <Card
              key={template.name}
              className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-slate-600 cursor-pointer transition-colors text-center"
            >
              <p className="font-medium text-slate-100 text-sm mb-1">
                {template.name}
              </p>
              <p className="text-xs text-slate-500">{template.frequency}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Drafts List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Newsletter Drafts</h2>
        <div className="space-y-3">
          {drafts.map((draft) => (
            <Card
              key={draft.id}
              className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer"
              onClick={() => handleDraftClick(draft)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-100 truncate">
                      {draft.title}
                    </h3>
                    <Badge className={getStatusColor(draft.status)}>
                      {draft.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                    {draft.preview}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Created {format(draft.created, 'MMM d')}</span>
                    {draft.scheduled && (
                      <span>Scheduled {format(draft.scheduled, 'MMM d')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
