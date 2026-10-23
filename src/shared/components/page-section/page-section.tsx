import { cn } from '@/shared/lib/utils/cn';
import { useId } from 'react';
import type { PageSectionProps } from './types';

export function PageSection({
  title,
  titleId,
  titleAdornment,
  actions,
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
      {(hasTitle || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {hasTitle && (
            <div className="flex min-w-0 items-center gap-3">
              <h2
                id={headingId}
                className="m-0 text-xs font-medium uppercase tracking-[0.07em] text-muted-foreground"
              >
                {title}
              </h2>
              {titleAdornment}
            </div>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
