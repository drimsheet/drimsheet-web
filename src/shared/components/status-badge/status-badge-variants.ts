import { cva } from 'class-variance-authority';

export const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold border transition-colors w-fit shrink-0',
  {
    variants: {
      variant: {
        success: 'bg-success-surface text-success border-success-border',
        info: 'bg-info-surface text-info border-info-border',
        warning: 'bg-warning-surface text-warning border-warning-border',
        error: 'bg-error-surface text-error border-error-border',
        neutral: 'bg-muted text-muted-foreground border-border',
        primary: 'bg-selection text-selection-foreground border-primary',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);
