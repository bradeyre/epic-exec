import React from 'react';
import { cn } from '@/lib/utils';

type HealthStatus = 'good' | 'warning' | 'critical';

interface HealthBadgeProps {
  score: number;
  label?: string;
  animated?: boolean;
}

export function HealthBadge({
  score,
  label,
  animated = false,
}: HealthBadgeProps) {
  let status: HealthStatus;
  let statusColor: string;
  let statusLabel: string;
  let dotColor: string;

  if (score >= 70) {
    status = 'good';
    statusColor = 'text-success';
    statusLabel = 'Good';
    dotColor = 'bg-success';
  } else if (score >= 40) {
    status = 'warning';
    statusColor = 'text-warning';
    statusLabel = 'Fair';
    dotColor = 'bg-warning';
  } else {
    status = 'critical';
    statusColor = 'text-danger';
    statusLabel = 'Poor';
    dotColor = 'bg-danger';
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'h-3 w-3 rounded-full transition-all duration-200',
            dotColor,
            animated && status === 'critical' && 'animate-pulse'
          )}
        />
        <span className={cn('text-xs font-semibold', statusColor)}>
          {score}/100
        </span>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <span className={cn('text-xs font-medium', statusColor)}>
        {statusLabel}
      </span>
    </div>
  );
}
