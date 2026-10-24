import { cva } from 'class-variance-authority';

export const statusBadgeVariants = cva(
  'inline-flex items-center gap-1 min-h-5 rounded-sm px-1.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors w-fit shrink-0',
  {
    variants: {
      variant: {
        success: 'bg-lozenge-success text-success',
        info: 'bg-lozenge-info text-info',
        warning: 'bg-lozenge-warning text-warning',
        error: 'bg-lozenge-error text-error',
        neutral: 'bg-lozenge-neutral text-lozenge-neutral-foreground',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);
