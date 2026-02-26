'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  GripVertical,
  CheckCircle2,
  Circle,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  Loader2,
  X,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCurrentCompany } from '@/contexts/company-context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface TaskAnalysis {
  id: string;
  title: string;
  functionName: string;
}

interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
}

interface DBTask {
  id: string;
  title: string;
  description: string | null;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  effort: 'QUICK' | 'MEDIUM' | 'SIGNIFICANT';
  dueDate: string | null;
  assignedTo: TaskAssignee | null;
  analysis: TaskAnalysis | null;
  comments: TaskComment[];
  createdAt: string;
}

interface UITask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  effort: string;
  dueDate: Date;
  assignee: { name: string; avatar: string };
  sourceAnalysis: string;
  created: Date;
  comments: Array<{ id: string; content: string; createdAt: Date }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const effortMap: Record<string, string> = {
  QUICK: 'S',
  MEDIUM: 'M',
  SIGNIFICANT: 'L',
};

function mapDBTaskToUI(task: DBTask): UITask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    effort: effortMap[task.effort] || task.effort,
    dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
    assignee: task.assignedTo
      ? { name: task.assignedTo.name, avatar: getInitials(task.assignedTo.name) }
      : { name: 'Unassigned', avatar: '—' },
    sourceAnalysis: task.analysis?.title || '—',
    created: new Date(task.createdAt),
    comments: (task.comments || []).map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: new Date(c.createdAt),
    })),
  };
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400',
    HIGH: 'bg-orange-500/20 text-orange-400',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400',
    LOW: 'bg-gray-500/20 text-gray-400',
  };
  return colors[priority] || colors.LOW;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'DONE':
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    case 'IN_PROGRESS':
      return <Circle className="w-5 h-5 text-blue-400" />;
    default:
      return <Circle className="w-5 h-5 text-slate-600" />;
  }
};

// Status cycle: TODO → IN_PROGRESS → DONE → TODO
const nextStatus: Record<string, string> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KanbanView({
  tasks,
  onStatusChange,
  onTaskClick,
}: {
  tasks: UITask[];
  onStatusChange: (id: string, status: string) => void;
  onTaskClick: (task: UITask) => void;
}) {
  const columns = {
    TODO: tasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter((t) => t.status === 'DONE'),
  };

  const renderColumn = (title: string, colTasks: UITask[], color: string) => (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', color)} />
          {title}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {colTasks.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {colTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors cursor-pointer space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-slate-100">{task.title}</p>
              <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                {task.effort}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{format(task.dueDate, 'MMM d')}</span>
              <Avatar className="w-6 h-6 text-xs">
                <div className="w-full h-full flex items-center justify-center bg-blue-500/30">
                  {task.assignee.avatar}
                </div>
              </Avatar>
            </div>
          </div>
        ))}
        {colTasks.length === 0 && (
          <div className="p-4 text-center text-sm text-slate-500 border border-dashed border-slate-700 rounded-lg">
            No tasks
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-6">
      {renderColumn('To Do', columns.TODO, 'bg-slate-400')}
      {renderColumn('In Progress', columns.IN_PROGRESS, 'bg-blue-400')}
      {renderColumn('Done', columns.DONE, 'bg-green-400')}
    </div>
  );
}

function ListView({
  tasks,
  onStatusChange,
  onTaskClick,
}: {
  tasks: UITask[];
  onStatusChange: (id: string, status: string) => void;
  onTaskClick: (task: UITask) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Title</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Priority</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Effort</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Due Date</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Assignee</th>
            <th className="px-4 py-3 text-left text-slate-400 font-medium">Source</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                No tasks yet. Run an analysis to generate action items, or add a task manually.
              </td>
            </tr>
          )}
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
            >
              <td className="px-4 py-3 text-slate-100 cursor-pointer hover:text-blue-400 transition-colors" onClick={() => onTaskClick(task)}>{task.title}</td>
              <td className="px-4 py-3">
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onStatusChange(task.id, nextStatus[task.status] || 'TODO')}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {getStatusIcon(task.status)}
                  <span className="text-slate-300">{task.status.replace('_', ' ')}</span>
                </button>
              </td>
              <td className="px-4 py-3 text-slate-300">{task.effort}</td>
              <td className="px-4 py-3 text-slate-400">{format(task.dueDate, 'MMM d, yyyy')}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 text-xs">
                    <div className="w-full h-full flex items-center justify-center bg-blue-500/30">
                      {task.assignee.avatar}
                    </div>
                  </Avatar>
                  <span className="text-slate-300">{task.assignee.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-400">{task.sourceAnalysis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalendarView({ tasks }: { tasks: UITask[] }) {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const days: (Date | null)[] = [];

  for (let i = firstDay.getDay(); i > 0; i--) {
    days.push(null);
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(today.getFullYear(), today.getMonth(), i));
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((day, dayIndex) => {
              const tasksForDay = day
                ? tasks.filter(
                    (t) => format(t.dueDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'),
                  )
                : [];

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    'min-h-24 p-2 rounded-lg border',
                    day
                      ? 'bg-slate-800/50 border-slate-700/50'
                      : 'bg-slate-900/50 border-slate-800',
                  )}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-slate-300 mb-2">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {tasksForDay.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className="text-xs p-1 rounded bg-blue-500/20 text-blue-300 truncate"
                          >
                            {task.title}
                          </div>
                        ))}
                        {tasksForDay.length > 2 && (
                          <div className="text-xs text-slate-500">
                            +{tasksForDay.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Detail Panel (with comments)
// ---------------------------------------------------------------------------

function TaskDetailPanel({
  task,
  onClose,
  onStatusChange,
  onCommentAdded,
}: {
  task: UITask;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onCommentAdded: () => void;
}) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, comment: commentText.trim() }),
      });
      if (res.ok) {
        setCommentText('');
        onCommentAdded();
      }
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full overflow-y-auto shadow-xl animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-slate-100 truncate">{task.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Status controls */}
          <div className="flex gap-2 flex-wrap">
            {['TODO', 'IN_PROGRESS', 'DONE'].map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(task.id, s)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full border transition-colors',
                  task.status === s
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500',
                )}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Priority</span>
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Effort</span>
              <span className="text-slate-200">{task.effort}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Due</span>
              <span className="text-slate-200">{format(task.dueDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Assignee</span>
              <span className="text-slate-200">{task.assignee.name}</span>
            </div>
            {task.sourceAnalysis !== '—' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Source</span>
                <span className="text-slate-200">{task.sourceAnalysis}</span>
              </div>
            )}
            {task.description && (
              <div className="text-sm">
                <span className="text-slate-400 block mb-1">Description</span>
                <p className="text-slate-200 bg-slate-800/50 rounded-lg p-3">{task.description}</p>
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Comments ({task.comments.length})
            </h3>

            {task.comments.length === 0 && (
              <p className="text-sm text-slate-500 mb-3">No comments yet. Add one below.</p>
            )}

            <div className="space-y-3 mb-4">
              {task.comments.map((c) => (
                <div key={c.id} className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-sm text-slate-200">{c.content}</p>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {format(c.createdAt, 'MMM d, h:mm a')}
                  </span>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                onClick={handleAddComment}
                disabled={!commentText.trim() || submitting}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Task Modal
// ---------------------------------------------------------------------------

function AddTaskModal({
  companyId,
  onClose,
  onCreated,
}: {
  companyId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [effort, setEffort] = useState<string>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          effort,
          dueDate: dueDate || undefined,
        }),
      });
      if (res.ok) {
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to create task', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-100">Add Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Review Q2 revenue forecast"
              className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              rows={3}
              className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-slate-100 placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority + Effort */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Effort</label>
              <select
                value={effort}
                onChange={(e) => setEffort(e.target.value)}
                className="w-full rounded-md bg-slate-800/50 border border-slate-700 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="QUICK">Quick (S)</option>
                <option value="MEDIUM">Medium (M)</option>
                <option value="SIGNIFICANT">Significant (L)</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-slate-100"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || saving} className="gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function TasksPage() {
  const company = useCurrentCompany();
  const companyId = company?.id || null;
  const [activeTab, setActiveTab] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<UITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UITask | null>(null);

  // Fetch tasks when companyId is ready
  const fetchTasks = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?companyId=${companyId}`);
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks.map((t: DBTask) => mapDBTaskToUI(t)));
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 3. Update task status
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update task', err);
      // Revert on failure
      fetchTasks();
    }
  };

  // 4. Filter by search
  const filteredTasks = searchQuery.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.sourceAnalysis.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.assignee.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tasks;

  // 5. Compute stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
    overdue: tasks.filter(
      (t) => t.status !== 'DONE' && t.dueDate < new Date(),
    ).length,
  };

  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-slate-400 text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pt-6">
        <h1 className="text-3xl font-bold text-slate-100">Tasks</h1>
        <Button className="gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">Total</div>
          <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">To Do</div>
          <div className="text-2xl font-bold text-slate-100">{stats.todo}</div>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">In Progress</div>
          <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">Done</div>
          <div className="text-2xl font-bold text-green-400">{stats.done}</div>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">Overdue</div>
          <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
        </Card>
      </div>

      {/* Empty state */}
      {tasks.length === 0 && !loading && (
        <Card className="p-8 bg-slate-800/30 border-slate-700/50 text-center">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200 mb-1">No tasks yet</h3>
          <p className="text-slate-400 text-sm mb-4">
            Run a CFO analysis to generate action items, or create a task manually.
          </p>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Task
          </Button>
        </Card>
      )}

      {/* Only show filter + views when there are tasks */}
      {tasks.length > 0 && (
        <>
          {/* Filter Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <Button variant="outline" className="gap-2 border-slate-700 text-slate-300">
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="kanban" onValueChange={setActiveTab}>
            <div className="flex gap-2 border-b border-slate-700">
              <button
                onClick={() => setActiveTab('kanban')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'kanban'
                    ? 'text-blue-400 border-blue-500'
                    : 'text-slate-400 border-transparent hover:text-slate-300',
                )}
              >
                Kanban
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'list'
                    ? 'text-blue-400 border-blue-500'
                    : 'text-slate-400 border-transparent hover:text-slate-300',
                )}
              >
                List
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'calendar'
                    ? 'text-blue-400 border-blue-500'
                    : 'text-slate-400 border-transparent hover:text-slate-300',
                )}
              >
                Calendar
              </button>
            </div>

            <div className="mt-6">
              {activeTab === 'kanban' && (
                <KanbanView tasks={filteredTasks} onStatusChange={handleStatusChange} onTaskClick={setSelectedTask} />
              )}
              {activeTab === 'list' && (
                <ListView tasks={filteredTasks} onStatusChange={handleStatusChange} onTaskClick={setSelectedTask} />
              )}
              {activeTab === 'calendar' && <CalendarView tasks={filteredTasks} />}
            </div>
          </Tabs>
        </>
      )}

      {/* Add Task Modal */}
      {showAddModal && companyId && (
        <AddTaskModal
          companyId={companyId}
          onClose={() => setShowAddModal(false)}
          onCreated={fetchTasks}
        />
      )}

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(id, status) => {
            handleStatusChange(id, status);
            setSelectedTask((prev) => (prev ? { ...prev, status } : null));
          }}
          onCommentAdded={() => {
            fetchTasks();
            // Refresh the selected task too
            setTimeout(() => {
              setSelectedTask((prev) => {
                if (!prev) return null;
                const updated = tasks.find((t) => t.id === prev.id);
                return updated || prev;
              });
            }, 500);
          }}
        />
      )}
    </div>
  );
}
