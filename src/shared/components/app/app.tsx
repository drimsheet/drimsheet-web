import { PageBreadcrumbs } from '@/shared/components/page-breadcrumbs';
import { PageTitle } from '@/shared/components/page-title';
import type { AppBodyProps } from './types';

export function AppBody({
  title,
  titleSlot,
  breadcrumbs,
  actionsSlot,
  children,
}: Readonly<AppBodyProps>) {
  const heading = titleSlot ?? title;

  const hasHeading =
    heading != null && typeof heading !== 'boolean' && heading !== '';

  const hasActions =
    actionsSlot != null &&
    typeof actionsSlot !== 'boolean' &&
    actionsSlot !== '';

  const hasHeader = !!breadcrumbs || hasHeading || hasActions;

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col">
      {hasHeader && (
        <header className="flex min-w-0 flex-col gap-4">
          {breadcrumbs && (
            <div className="flex min-h-10 min-w-0 items-center wrap-anywhere">
              <PageBreadcrumbs breadcrumb={breadcrumbs} />
            </div>
          )}
          {(hasHeading || hasActions) && (
            <div className="flex min-h-10 min-w-0 flex-wrap items-center justify-between gap-4">
              {hasHeading && (
                <PageTitle className="flex min-w-0 flex-wrap items-center gap-3 wrap-anywhere">
                  {heading}
                </PageTitle>
              )}
              {hasActions && (
                <div className="ml-auto flex max-w-full flex-wrap items-center gap-2">
                  {actionsSlot}
                </div>
              )}
            </div>
          )}
        </header>
      )}
      {children}
    </div>
  );
}
