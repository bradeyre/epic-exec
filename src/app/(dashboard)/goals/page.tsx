'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCurrentCompany } from '@/contexts/company-context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GoalProgress {
  id: string;
  month: string;
  onTrack: boolean | null;
  jimFeedback: string | null;
  createdAt: string;
}

interface GoalBreakdown {
  summary?: string;
  milestones?: Array<{ month: string; target: string; metric: string }>;
  growthLevers?: string[];
  keyRisks?: string[];
  quickWins?: string[];
  monthlyCheckpoints?: string;
  rawAnalysis?: string;
}

interface Goal {
  id: string;
  title: string;
  target: string;
  deadline: string;
  status: string;
  breakdown: GoalBreakdown | null;
  progress: GoalProgress[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Goal Card
// ---------------------------------------------------------------------------

function GoalCard({ goal }: { goal: Goal }) {
  const [expanded, setExpanded] = useState(false);
  const bd = goal.breakdown;
  const latestProgress = goal.progress[0];
  const trackStatus =
    latestProgress?.onTrack === true
      ? 'on-track'
      : latestProgress?.onTrack === false
        ? 'off-track'
        : 'no-checkin';

  const deadlineDate = new Date(goal.deadline);
  const now = new Date();
  const totalDays = (deadlineDate.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (now.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const progressPercent = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-100">{goal.title}</h3>
            <p className="text-sm text-slate-400 mt-1">
              Target: <span className="text-slate-200 font-medium">{goal.target}</span>
            </p>
          </div>
          <Badge
            className={cn(
              'text-xs flex-shrink-0',
              trackStatus === 'on-track' && 'bg-green-500/20 text-green-400',
              trackStatus === 'off-track' && 'bg-red-500/20 text-red-400',
              trackStatus === 'no-checkin' && 'bg-slate-500/20 text-slate-400',
            )}
          >
            {trackStatus === 'on-track' && '✅ On Track'}
            {trackStatus === 'off-track' && '⚠️ Off Track'}
            {trackStatus === 'no-checkin' && 'No Check-in Yet'}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Time elapsed</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(deadlineDate, 'MMM d, yyyy')}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                progressPercent > 80 ? 'bg-red-500' : progressPercent > 50 ? 'bg-yellow-500' : 'bg-blue-500',
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Jim's Summary */}
        {bd?.summary && (
          <p className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3 mb-3">
            💡 {bd.summary}
          </p>
        )}

        {/* Quick Wins */}
        {bd?.quickWins && bd.quickWins.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {bd.quickWins.map((w, i) => (
              <Badge key={i} variant="outline" className="border-blue-500/30 text-blue-300 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {w}
              </Badge>
            ))}
          </div>
        )}

        {/* Expand/Collapse */}
        {bd && (bd.milestones || bd.growthLevers || bd.keyRisks) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            {expanded ? 'Hide' : 'Show'} Jim&apos;s full breakdown
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Expanded Breakdown */}
      {expanded && bd && (
        <div className="border-t border-slate-700/50 p-5 space-y-5 bg-slate-900/30">
          {/* Milestones */}
          {bd.milestones && bd.milestones.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-blue-400" />
                Milestones
              </h4>
              <div className="space-y-2">
                {bd.milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs flex-shrink-0 mt-0.5">
                      {m.month}
                    </Badge>
                    <div>
                      <p className="text-slate-200">{m.target}</p>
                      {m.metric && <p className="text-slate-400 text-xs mt-0.5">{m.metric}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Growth Levers */}
          {bd.growthLevers && bd.growthLevers.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Growth Levers
              </h4>
              <ul className="space-y-1">
                {bd.growthLevers.map((l, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 text-green-400 mt-1 flex-shrink-0" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Risks */}
          {bd.keyRisks && bd.keyRisks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Key Risks
              </h4>
              <ul className="space-y-1">
                {bd.keyRisks.map((r, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Monthly Checkpoints */}
          {bd.monthlyCheckpoints && (
            <div className="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-3">
              <span className="font-medium text-slate-300">Monthly check-in: </span>
              {bd.monthlyCheckpoints}
            </div>
          )}

          {/* Raw analysis fallback */}
          {bd.rawAnalysis && !bd.milestones && (
            <div className="text-sm text-slate-300 whitespace-pre-wrap">{bd.rawAnalysis}</div>
          )}
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Add Goal Modal
// ---------------------------------------------------------------------------

function AddGoalModal({
  companyId,
  onClose,
  onCreated,
}: {
  companyId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [askJim, setAskJim] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !target.trim() || !deadline) return;

    setSaving(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          title: title.trim(),
          target: target.trim(),
          deadline,
          askJim,
        }),
      });
      if (res.ok) {
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to create goal', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-100">Set a Business Goal</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Goal Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grow monthly revenue to R500K"
              className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Target *</label>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. R500,000 monthly revenue"
              className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
            <p className="text-xs text-slate-500 mt-1">Be specific — include a number or measurable outcome</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Deadline *</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-slate-100"
            />
          </div>

          {/* Ask Jim toggle */}
          <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer">
            <input
              type="checkbox"
              checked={askJim}
              onChange={(e) => setAskJim(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600"
            />
            <div>
              <p className="text-sm text-slate-200 font-medium">Ask Jim for a breakdown</p>
              <p className="text-xs text-slate-400">Jim will create milestones, identify growth levers, and flag risks</p>
            </div>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !target.trim() || !deadline || saving} className="gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? (askJim ? 'Jim is analyzing...' : 'Creating...') : 'Create Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Goals Page
// ---------------------------------------------------------------------------

export default function GoalsPage() {
  const company = useCurrentCompany();
  const companyId = company?.id || null;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load goals
  const fetchGoals = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/goals?companyId=${companyId}`);
      const data = await res.json();
      if (data.success && data.goals) {
        setGoals(data.goals);
      }
    } catch (err) {
      console.error('Failed to load goals', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  if (loading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-slate-400 text-sm">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Goals</h1>
          <p className="text-slate-400 mt-1">Set targets and let Jim track your progress</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {/* Stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-800/50 border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Active Goals</div>
            <div className="text-2xl font-bold text-slate-100">{goals.length}</div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">On Track</div>
            <div className="text-2xl font-bold text-green-400">
              {goals.filter((g) => g.progress[0]?.onTrack === true).length}
            </div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Need Attention</div>
            <div className="text-2xl font-bold text-orange-400">
              {goals.filter((g) => g.progress[0]?.onTrack === false).length}
            </div>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {goals.length === 0 && !loading && (
        <Card className="p-8 bg-slate-800/30 border-slate-700/50 text-center">
          <Target className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200 mb-1">No goals set yet</h3>
          <p className="text-slate-400 text-sm mb-4">
            Set a business goal and Jim will break it down into milestones, growth levers, and risks.
          </p>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Set Your First Goal
          </Button>
        </Card>
      )}

      {/* Goal Cards */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && companyId && (
        <AddGoalModal
          companyId={companyId}
          onClose={() => setShowAddModal(false)}
          onCreated={fetchGoals}
        />
      )}
    </div>
  );
}
