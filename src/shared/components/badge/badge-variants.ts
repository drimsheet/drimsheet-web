import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive-border aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default:
          'bg-selection text-selection-foreground [a]:hover:bg-selection-hover',
        primary:
          'bg-primary text-primary-foreground [a]:hover:bg-primary-hover',
        secondary:
          'bg-secondary text-secondary-foreground [a]:hover:bg-secondary-hover',
        neutral:
          'bg-lozenge-neutral text-lozenge-neutral-foreground [a]:hover:bg-accent',
        destructive:
          'bg-lozenge-error text-destructive focus-visible:ring-destructive [a]:hover:bg-destructive-hover',
        outline:
          'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-link underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
