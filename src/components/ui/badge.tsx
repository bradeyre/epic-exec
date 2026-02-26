import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-200',
  {
    variants: {
      variant: {
        default:
          'bg-accent/10 text-accent border border-accent/20',
        secondary:
          'bg-muted hover:bg-muted/80 text-muted-foreground border border-border',
        destructive:
          'bg-destructive/10 text-destructive border border-destructive/20',
        outline:
          'border border-border bg-transparent text-muted-foreground',
        success:
          'bg-success/10 text-success border border-success/20',
        warning:
          'bg-warning/10 text-warning border border-warning/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
