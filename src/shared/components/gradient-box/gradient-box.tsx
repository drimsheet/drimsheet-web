import { cn } from '@/shared/lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const gradientBoxVariants = cva(
  'group relative z-0 overflow-hidden rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-inner hover:brightness-110',
  {
    variants: {
      variant: {
        primary:
          'text-primary-foreground bg-linear-to-br from-primary to-primary-hover',

        success:
          'text-success bg-linear-to-br from-success-surface to-success-hover',

        info: 'text-info bg-linear-to-br from-info-surface to-info-hover',

        warning:
          'text-warning bg-linear-to-br from-warning-surface to-warning-hover',

        danger: 'text-error bg-linear-to-br from-error-surface to-error-hover',

        grey: 'text-foreground bg-linear-to-br from-muted to-accent',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export interface GradientBoxProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gradientBoxVariants> {}

export function GradientBox({
  className,
  variant,
  ...props
}: Readonly<GradientBoxProps>) {
  return (
    <div
      className={cn(gradientBoxVariants({ variant }), className)}
      {...props}
    />
  );
}
