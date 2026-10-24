import type { VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import type { statusBadgeVariants } from './status-badge-variants';

export interface StatusBadgeProps
  extends
    HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  label: string;
  showDot?: boolean;
}

export type TStatusBadgeValue = Pick<StatusBadgeProps, 'variant' | 'label'>;
