import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkline } from './sparkline';
import { HealthBadge } from './health-badge';

export interface MetricCardProps {
  label?: string;
  title?: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'flat' | string;
  sparkline?: number[];
  sparklineData?: number[];
  subtitle?: string;
  subtitleColor?: string;
  healthScore?: number;
  chart?: any;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

export function MetricCard({
  label: labelProp,
  title,
  value,
  unit,
  change,
  changeLabel,
  trend,
  sparkline,
  sparklineData,
  subtitle,
  subtitleColor,
  healthScore,
  chart,
  onClick,
  className,
  loading = false,
}: MetricCardProps) {
  const label = labelProp || title || '';
  const sparkData = sparklineData || sparkline;
  const isPositive = trend === 'up' || (change !== undefined && change > 0);
  const isNegative = trend === 'down' || (change !== undefined && change < 0);
  const isFlat = trend === 'flat' || change === 0;

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        onClick && 'cursor-pointer hover:border-accent/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
            <div className="flex items-baseline gap-2">
              {loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <span className="font-mono text-3xl font-bold text-foreground">
                    {value}
                  </span>
                  {unit && (
                    <span className="text-sm text-muted-foreground">{unit}</span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Health Badge */}
          {healthScore !== undefined && (
            <div className="ml-4">
              <HealthBadge score={healthScore} />
            </div>
          )}
        </div>

        {/* Change Indicator and Sparkline */}
        <div className="flex items-end justify-between">
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive && (
                <>
                  <TrendingUp size={16} className="text-success" />
                  <span className="text-sm font-semibold text-success">
                    +{change.toFixed(1)}%
                  </span>
                </>
              )}
              {isNegative && (
                <>
                  <TrendingDown size={16} className="text-danger" />
                  <span className="text-sm font-semibold text-danger">
                    {change.toFixed(1)}%
                  </span>
                </>
              )}
              {isFlat && (
                <>
                  <Minus size={16} className="text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground">
                    0%
                  </span>
                </>
              )}
              {changeLabel && (
                <span className="text-xs text-muted-foreground ml-1">
                  {changeLabel}
                </span>
              )}
            </div>
          )}

          {/* Sparkline */}
          {sparkData && sparkData.length > 0 && (
            <div className="ml-4">
              <Sparkline
                data={sparkData}
                width={80}
                height={24}
                color={
                  isPositive ? '#10B981' : isNegative ? '#EF4444' : '#94A3B8'
                }
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
