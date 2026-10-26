import { cn } from '@/shared/lib/utils/cn';
import { useId } from 'react';
import type { AppSectionProps } from './types';

export function AppSection({
  title,
  titleId,
  className,
  children,
  ...props
}: Readonly<AppSectionProps>) {
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
      {hasTitle && (
        <h2
          id={headingId}
          className="m-0 text-xs font-medium uppercase tracking-[0.07em] text-muted-foreground"
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
