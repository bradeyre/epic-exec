'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Zap, AlertCircle, Calendar, Plus, X } from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedEffort: 'low' | 'medium' | 'high';
  suggestedDueDate: string;
  assignedTo?: string;
  selected: boolean;
  isMCPEligible?: boolean;
}

interface StepActionItemsProps {
  actionItems: ActionItem[];
  onActionItemsChange: (items: ActionItem[]) => void;
  onCreateSelected: () => void;
  isCreating?: boolean;
  teamMembers?: Array<{ id: string; name: string; email: string }>;
}

const MOCK_TEAM_MEMBERS = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@company.com' },
  { id: '2', name: 'Marcus Johnson', email: 'marcus@company.com' },
  { id: '3', name: 'Emma Davis', email: 'emma@company.com' },
  { id: '4', name: 'Unassigned', email: '' },
];

function PriorityBadge({ priority }: { priority: string }) {
  const config = {
    critical: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-900 dark:text-red-100' },
    high: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-900 dark:text-blue-100' },
    medium: { bg: 'bg-slate-100 dark:bg-slate-950', text: 'text-slate-900 dark:text-slate-100' },
    low: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-900 dark:text-blue-100' },
  };

  const c = config[priority as keyof typeof config];
  return <Badge className={`${c.bg} ${c.text} text-xs`}>{priority.toUpperCase()}</Badge>;
}

function EffortBadge({ effort }: { effort: string }) {
  const config = {
    low: { label: '1-2 hours' },
    medium: { label: '2-4 hours' },
    high: { label: '4+ hours' },
  };
  return <Badge variant="outline">{config[effort as keyof typeof config].label}</Badge>;
}

export function StepActionItems({
  actionItems,
  onActionItemsChange,
  onCreateSelected,
  isCreating = false,
  teamMembers = MOCK_TEAM_MEMBERS,
}: StepActionItemsProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customPriority, setCustomPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [customEffort, setCustomEffort] = useState<'low' | 'medium' | 'high'>('medium');

  const selectedCount = actionItems.filter((item) => item.selected).length;

  const handleAddCustomTask = () => {
    if (!customTitle.trim()) return;
    const newItem: ActionItem = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      description: customDescription.trim(),
      priority: customPriority,
      estimatedEffort: customEffort,
      suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      selected: true,
    };
    onActionItemsChange([...actionItems, newItem]);
    setCustomTitle('');
    setCustomDescription('');
    setCustomPriority('medium');
    setCustomEffort('medium');
    setShowCustomForm(false);
  };

  const handleToggleItem = (itemId: string) => {
    onActionItemsChange(
      actionItems.map((item) =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleSelectAll = () => {
    onActionItemsChange(actionItems.map((item) => ({ ...item, selected: true })));
  };

  const handleDeselectAll = () => {
    onActionItemsChange(actionItems.map((item) => ({ ...item, selected: false })));
  };

  const handleAssignTo = (itemId: string, assigneeId: string) => {
    onActionItemsChange(
      actionItems.map((item) =>
        item.id === itemId ? { ...item, assignedTo: assigneeId } : item
      )
    );
  };

  const handleUpdateItem = (
    itemId: string,
    field: string,
    value: string
  ) => {
    onActionItemsChange(
      actionItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Generated Tasks</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedCount} of {actionItems.length} tasks selected to create
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSelectAll}
            disabled={selectedCount === actionItems.length}
          >
            Select All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDeselectAll}
            disabled={selectedCount === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-4">
        {actionItems.map((item) => (
          <Card
            key={item.id}
            className={`p-6 transition-all ${
              item.selected ? 'border-accent border-2 bg-accent/5' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              <Checkbox
                checked={item.selected}
                onCheckedChange={() => handleToggleItem(item.id)}
                className="h-5 w-5"
              />

              {/* Content */}
              <div className="flex-1 space-y-4">
                {/* Title and Badges */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <PriorityBadge priority={item.priority} />
                    <EffortBadge effort={item.estimatedEffort} />
                    {item.isMCPEligible && (
                      <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-100">
                        <Zap className="w-3 h-3 mr-1" />
                        MCP Ready
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Editable Fields */}
                {item.selected && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    {/* Due Date */}
                    <div>
                      <Label htmlFor={`due-${item.id}`} className="text-sm font-medium">
                        Due Date
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <Input
                          id={`due-${item.id}`}
                          type="date"
                          value={item.suggestedDueDate}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'suggestedDueDate', e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Assign To */}
                    <div>
                      <Label htmlFor={`assign-${item.id}`} className="text-sm font-medium">
                        Assign To
                      </Label>
                      <Select
                        value={item.assignedTo || ''}
                        onValueChange={(value) => handleAssignTo(item.id, value)}
                      >
                        <SelectTrigger id={`assign-${item.id}`} className="mt-2">
                          <SelectValue placeholder="Select team member..." />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Custom Task */}
      {!showCustomForm ? (
        <Button
          variant="outline"
          onClick={() => setShowCustomForm(true)}
          className="w-full border-dashed border-slate-600 text-slate-300 hover:text-slate-100 hover:border-slate-500 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Custom Task
        </Button>
      ) : (
        <Card className="p-5 border-accent/50 bg-accent/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">New Custom Task</h3>
            <button onClick={() => setShowCustomForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <Input
              placeholder="Task title *"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              autoFocus
            />
            <Textarea
              placeholder="Description (optional)"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select value={customPriority} onValueChange={(v) => setCustomPriority(v as 'critical' | 'high' | 'medium' | 'low')}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={customEffort} onValueChange={(v) => setCustomEffort(v as 'low' | 'medium' | 'high')}>
                <SelectTrigger><SelectValue placeholder="Effort" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Quick (1-2h)</SelectItem>
                  <SelectItem value="medium">Medium (2-4h)</SelectItem>
                  <SelectItem value="high">Significant (4h+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCustomForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddCustomTask} disabled={!customTitle.trim()}>Add Task</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Information Box */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">Tips for effective task management:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Tasks can be edited after creation in the task manager</li>
              <li>MCP-ready tasks can be automatically executed with approvals</li>
              <li>Assign tasks to specific team members to ensure accountability</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Create Button */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button
          onClick={onCreateSelected}
          disabled={selectedCount === 0 || isCreating}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isCreating ? 'Creating Tasks...' : `Create ${selectedCount} Task${selectedCount !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}
