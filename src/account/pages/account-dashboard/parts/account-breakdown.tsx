import { Button } from '@/shared/components/button';
import { Card, CardContent, CardHeader } from '@/shared/components/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dashboardHelpers from '../helper';
import type { AccountBreakdownProps } from '../types';
import { DashboardError } from './section-error';

export function AccountBreakdown({
  type,
  accounts,
  loading,
  error,
  hasMore,
  loadingMore,
  onLoadMore,
  onViewAccount,
}: Readonly<AccountBreakdownProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');
  const locale = i18n.resolvedLanguage ?? 'en';
  const title = t(`dashboard_${type}_title`);
  const empty_title = t(`dashboard_no_${type}_title`);
  const empty_description = t(`dashboard_no_${type}_description`);
  const error_title = t('dashboard_breakdown_error_title');
  const more_label = t('dashboard_more_accounts_label');
  const scale_label = t('dashboard_share_scale_label');
  const unavailable_label = t('dashboard_share_unavailable_label');

  if (loading) return <AccountBreakdownSkeleton type={type} />;

  return (
    <Card
      role="region"
      aria-label={title}
      tabIndex={0}
      className="max-h-[300px] min-h-[200px] min-w-0 gap-2 overflow-y-auto overscroll-contain py-0 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <CardHeader className="sticky top-0 z-1 shrink-0 bg-card px-4 pt-4 pb-2">
        <h3 className="m-0 text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        <span className="sr-only">{scale_label}</span>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {!loading && accounts.length === 0 && !error && (
          <Empty className="px-0 py-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Landmark aria-hidden />
              </EmptyMedia>
              <EmptyTitle>{empty_title}</EmptyTitle>
              <EmptyDescription>{empty_description}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {!loading && (
          <ul className="flex flex-col gap-1">
            {accounts.map((account) => {
              const width = dashboardHelpers.shareWidth(
                account.sharePercentage
              );

              return (
                <li key={account.accountId}>
                  <button
                    type="button"
                    onClick={() => onViewAccount(account.accountId)}
                    className="flex w-full flex-col gap-2 rounded-sm py-2.5 text-left hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span className="flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-2 text-sm">
                      <span className="min-w-0 break-words">
                        {account.accountName}
                      </span>
                      <span className="ml-auto flex flex-wrap gap-x-3 gap-y-2 tabular-nums">
                        <Money value={account.amount} />
                        <span className="text-muted-foreground">
                          {dashboardHelpers.formatPercentage(
                            account.sharePercentage,
                            locale
                          )}
                        </span>
                      </span>
                    </span>
                    {width !== null && (
                      <span
                        aria-hidden
                        className="block h-1.5 w-full overflow-hidden rounded-sm bg-chart-track"
                      >
                        <span
                          className={
                            type === 'asset'
                              ? 'block h-full rounded-sm bg-primary'
                              : 'block h-full rounded-sm bg-secondary'
                          }
                          style={{ width: `${width}%` }}
                        />
                      </span>
                    )}
                    {width === null && (
                      <span className="sr-only">{unavailable_label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {error && <DashboardError title={error_title} />}
        {hasMore && !error && (
          <Button
            variant="ghost"
            onClick={onLoadMore}
            loading={loadingMore}
            className="mt-2"
          >
            {more_label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function AccountBreakdownSkeleton({
  type,
}: Readonly<Pick<AccountBreakdownProps, 'type'>>) {
  const { t } = useTranslation('ledger-accounts');
  const title = t(`dashboard_${type}_title`);
  const loading_label = t('dashboard_loading_breakdown');

  return (
    <Card
      role="region"
      aria-label={title}
      aria-busy="true"
      className="max-h-[300px] min-h-[200px] min-w-0 gap-2 overflow-y-auto py-0"
    >
      <CardHeader className="sticky top-0 z-1 shrink-0 bg-card px-4 pt-4 pb-2">
        <h3 className="m-0 text-sm font-medium text-muted-foreground">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-1">
          <output className="sr-only" aria-label={loading_label}>
            {loading_label}
          </output>
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex flex-col gap-2 py-2.5">
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
