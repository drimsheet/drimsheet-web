import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/card';
import { Empty, EmptyHeader, EmptyTitle } from '@/shared/components/empty';
import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { cn } from '@/shared/lib/utils/cn';
import { useTranslation } from 'react-i18next';
import categoryDetailsHelpers from '../helper';
import type { CounterpartyShareProps } from '../types';

export function CounterpartyShare({
  counterparties,
  type,
  pagination,
  loading,
  error,
  onPageChange,
  onRetry,
  selectedId,
  onSelect,
}: Readonly<CounterpartyShareProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');

  const percentage = new Intl.NumberFormat(i18n.resolvedLanguage, {
    style: 'percent',
    maximumFractionDigits: 2,
  });

  const ready = !loading && !error;
  const title = t('category_details_share_title');
  const description = t('category_details_share_description');

  const empty_text = t('category_details_share_empty_text');

  const unassigned_label = t('category_details_unassigned_label');
  const self_label = t('category_details_self_label');
  const loading_label = t('category_details_share_loading_label');
  const error_text = t('details_load_error_text');
  const retry_label = t('details_retry_label');
  const previous_label = t('category_details_share_previous_label');
  const next_label = t('category_details_share_next_label');

  const page_text = t('category_details_share_page_text', {
    page: pagination?.page,
    total: pagination?.totalPages,
  });

  const unavailable_label = t('category_details_share_unavailable_label');
  const signed_description = t('category_details_signed_share_description');

  return (
    <Card className="min-w-0" role="region" aria-label={title}>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {loading && (
          <div
            role="status"
            aria-label={loading_label}
            className="flex min-h-56 flex-col gap-5"
          >
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        {!loading && error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error_text}
              <Button variant="ghost" onClick={onRetry}>
                {retry_label}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {ready && counterparties.length === 0 && (
          <Empty className="min-h-56">
            <EmptyHeader>
              <EmptyTitle>{empty_text}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )}
        {ready &&
          counterparties.map((row) => {
            const id = categoryDetailsHelpers.participationId(row);
            const fallback = row.isSelf ? self_label : unassigned_label;
            const name = row.counterparty?.name ?? fallback;
            const share = row.participation.totalShare;
            const showBar = share !== null && share >= 0 && share <= 100;

            return (
              <button
                key={id}
                type="button"
                aria-pressed={selectedId === id}
                onClick={() => onSelect(row)}
                className={cn(
                  'flex min-h-11 w-full min-w-0 flex-col gap-2 rounded-md p-2 text-left hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring',
                  selectedId === id && 'bg-accent ring-1 ring-border'
                )}
              >
                <span className="flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
                  <span className="min-w-0 wrap-anywhere">{name}</span>
                  <span className="flex gap-2 tabular-nums">
                    <Money value={row.participation.functionalAmount} />
                    <span
                      className="text-muted-foreground"
                      aria-label={
                        share === null ? unavailable_label : undefined
                      }
                    >
                      {share === null ? '—' : percentage.format(share / 100)}
                    </span>
                  </span>
                </span>
                {showBar && (
                  <span
                    className="h-1.5 w-full overflow-hidden rounded-full bg-chart-track"
                    aria-hidden="true"
                  >
                    <span
                      className={cn(
                        'block h-full rounded-full',
                        type === 'revenue'
                          ? 'bg-financial-income'
                          : 'bg-financial-expense'
                      )}
                      style={{ width: `${share}%` }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        {ready &&
          counterparties.some(
            ({ participation }) =>
              participation.totalShare !== null &&
              (participation.totalShare < 0 || participation.totalShare > 100)
          ) && (
            <p className="text-xs text-muted-foreground">
              {signed_description}
            </p>
          )}
        {ready && pagination && pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              {previous_label}
            </Button>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              {page_text}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              {next_label}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
