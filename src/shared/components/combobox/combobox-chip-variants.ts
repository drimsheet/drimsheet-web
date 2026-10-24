import { cva } from 'class-variance-authority';

export const comboboxChipVariants = cva(
  'flex min-h-5 w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0',
  {
    variants: {
      variant: {
        neutral: 'bg-lozenge-neutral text-lozenge-neutral-foreground',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
      },
    },
    defaultVariants: { variant: 'neutral' },
  }
);
