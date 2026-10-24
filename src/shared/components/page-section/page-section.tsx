import { cn } from '@/shared/lib/utils/cn';
import { useId } from 'react';
import type { PageSectionProps, PageSectionTitleProps } from './types';

export function PageSectionTitle({
  className,
  ...props
}: Readonly<PageSectionTitleProps>) {
  return (
    <h2
      {...props}
      className={cn(
        'm-0 text-xs font-medium uppercase tracking-[0.07em] text-muted-foreground',
        className
      )}
    />
  );
}

export function PageSection({
  title,
  titleId,
  className,
  children,
  ...props
}: Readonly<PageSectionProps>) {
  const generatedId = useId();
  const headingId = titleId ?? generatedId;

  const hasTitle =
    title !== undefined && title !== null && title !== false && title !== '';

  return (
    <section
      aria-labelledby={hasTitle && !props['aria-label'] ? headingId : undefined}
      {...props}
      className={cn('flex min-w-0 flex-col gap-4 py-7', className)}
    >
      {hasTitle && <PageSectionTitle id={headingId}>{title}</PageSectionTitle>}
      {children}
    </section>
  );
}
