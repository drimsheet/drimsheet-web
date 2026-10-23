import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/shared/components/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { cn } from '@/shared/lib/utils/cn';
import { ChartNoAxesCombined } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import categoriesHelpers from '../helper';
import type { CategoryChartProps } from '../types';

export function CategoryChart({
  title,
  type,
  description,
  section,
  onViewAccount,
}: Readonly<CategoryChartProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';
  const rows = categoriesHelpers.chartRows(section.accounts);
  const empty_text = t('categories_chart_empty_text');
  const empty_description = t('categories_chart_empty_description');

  return (
    <Card
      role="region"
      aria-label={title}
      tabIndex={0}
      className="max-h-[400px] min-w-0 gap-2 overflow-y-auto overscroll-contain py-0 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <CardHeader className="sticky top-0 z-1 shrink-0 bg-card px-4 pt-4 pb-2">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        {rows.length > 0 && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {rows.length === 0 && (
          <Empty className="px-4 py-3">
            <EmptyHeader className="gap-1">
              <EmptyMedia variant="icon" className="mb-0">
                <ChartNoAxesCombined aria-hidden />
              </EmptyMedia>
              <EmptyTitle>{empty_text}</EmptyTitle>
              <EmptyDescription>{empty_description}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        <ul className="flex flex-col gap-4">
          {rows.map(({ account, left, width, zero, negative }) => (
            <li key={account.accountId}>
              <button
                type="button"
                onClick={() => onViewAccount(account.accountId)}
                className="flex w-full flex-col gap-2 rounded-sm py-2 text-left focus-visible:outline-2 focus-visible:outline-ring hover:bg-muted/40"
              >
                <span className="flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm">
                  <span className="min-w-0 break-words font-medium">
                    {account.accountName}
                  </span>
                  <span className="flex flex-wrap gap-x-4 gap-y-2 tabular-nums">
                    <Money value={account.amount} />
                    <span className="text-muted-foreground">
                      {categoriesHelpers.formatPercentage(
                        account.sharePercentage,
                        locale
                      )}
                    </span>
                  </span>
                </span>
                <span
                  aria-hidden
                  className="relative block h-1.5 w-full rounded-full bg-chart-track"
                >
                  <span
                    className="absolute inset-y-0 w-px bg-border"
                    style={{ left: `${zero}%` }}
                  />
                  <span
                    className={cn(
                      'absolute inset-y-0 rounded-sm',
                      type === 'revenue'
                        ? 'bg-financial-income'
                        : 'bg-financial-expense',
                      negative && 'bg-financial-neutral'
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function CategoryChartSkeleton({
  title,
}: Readonly<Pick<CategoryChartProps, 'title'>>) {
  return (
    <Card
      aria-busy="true"
      className="max-h-[400px] min-w-0 gap-2 overflow-y-auto py-0"
    >
      <output className="sr-only" aria-label={title} aria-busy="true">
        {title}
      </output>
      <CardHeader className="sticky top-0 z-1 shrink-0 bg-card px-4 pt-4 pb-2">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <Skeleton className="h-4 w-full max-w-64" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex flex-col gap-2 py-2">
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-2">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {title}
                </h2>
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
