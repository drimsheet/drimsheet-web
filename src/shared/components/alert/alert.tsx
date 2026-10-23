import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/shared/lib/utils/cn';

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'bg-destructive-surface border-destructive-border text-destructive *:data-[slot=alert-description]:text-destructive *:[svg]:text-current',
        success:
          'bg-success-surface border-success-border text-success *:data-[slot=alert-description]:text-success *:[svg]:text-current',
        info: 'bg-info-surface border-info-border text-info *:data-[slot=alert-description]:text-info *:[svg]:text-current',
        warning:
          'bg-warning-surface border-warning-border text-warning *:data-[slot=alert-description]:text-warning *:[svg]:text-current',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: Readonly<React.ComponentProps<'div'> & VariantProps<typeof alertVariants>>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({
  className,
  ...props
}: Readonly<React.ComponentProps<'div'>>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'font-heading font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: Readonly<React.ComponentProps<'div'>>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
        className
      )}
      {...props}
    />
  );
}

function AlertAction({
  className,
  ...props
}: Readonly<React.ComponentProps<'div'>>) {
  return (
    <div
      data-slot="alert-action"
      className={cn('absolute top-2.5 right-3', className)}
      {...props}
    />
  );
}

function WarningAlert({
  className,
  ...props
}: Readonly<React.ComponentProps<'div'>>) {
  return (
    <Alert variant="warning" className={cn('max-w-md', className)} {...props} />
  );
}

export { Alert, AlertAction, AlertDescription, AlertTitle, WarningAlert };
