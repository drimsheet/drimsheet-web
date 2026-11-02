import { Alert, AlertDescription } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/components/empty';
import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { cn } from '@/shared/lib/utils/cn';
import { UsersRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import categoryDetailsHelpers from '../helper';
import type {
  CategoryPartWithStateProps,
  CounterpartyShareProps,
} from '../types';

export function CounterpartyShare({
  counterparties,
  type,
  pagination,
  loading,
  error,
  onPageChange,
  selectedId,
  onSelect,
}: Readonly<CounterpartyShareProps>) {
  const { t, i18n } = useTranslation('ledger-accounts');

  const percentage = new Intl.NumberFormat(i18n.resolvedLanguage, {
    style: 'percent',
    maximumFractionDigits: 2,
  });

  const title = t('category_details_share_title');

  const empty_text = t('category_details_share_empty_text');
  const empty_description = t('category_details_share_empty_description');

  const unassigned_label = t('category_details_unassigned_label');
  const self_label = t('category_details_self_label');
  const previous_label = t('category_details_share_previous_label');
  const next_label = t('category_details_share_next_label');

  const page_text = t('category_details_share_page_text', {
    page: pagination?.page,
    total: pagination?.totalPages,
  });

  const unavailable_label = t('category_details_share_unavailable_label');
  const signed_description = t('category_details_signed_share_description');

  return (
    <CounterpartyShareWithState loading={loading} error={error}>
      <div className="min-w-0" role="region" aria-label={title}>
        <div className="flex flex-col gap-3">
          {counterparties.length === 0 && (
            <Empty className="min-h-56 px-4 py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersRound aria-hidden />
                </EmptyMedia>
                <EmptyTitle>{empty_text}</EmptyTitle>
                <EmptyDescription>{empty_description}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          {counterparties.map((row) => {
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
          {counterparties.some(
            ({ participation }) =>
              participation.totalShare !== null &&
              (participation.totalShare < 0 || participation.totalShare > 100)
          ) && (
            <p className="text-xs text-muted-foreground">
              {signed_description}
            </p>
          )}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                {previous_label}
              </Button>
              <span
                className="text-xs text-muted-foreground"
                aria-live="polite"
              >
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
        </div>
      </div>
    </CounterpartyShareWithState>
  );
}

export function CounterpartyShareSkeleton() {
  const { t } = useTranslation('ledger-accounts');
  const loading_label = t('category_details_share_loading_label');

  const category_details_share_title = t('category_details_share_title');

  return (
    <div
      className="min-w-0"
      role="region"
      aria-label={category_details_share_title}
      aria-busy="true"
    >
      <div className="flex min-h-56 flex-col gap-3">
        <output className="sr-only" aria-label={loading_label}>
          {loading_label}
        </output>
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="flex min-h-11 min-w-0 flex-col gap-2 rounded-md p-2"
          >
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CounterpartyShareError() {
  const { t } = useTranslation('ledger-accounts');
  const share_title = t('category_details_share_title');
  const error_text = t('details_load_error_text');

  return (
    <div className="min-w-0" role="region" aria-label={share_title}>
      <Alert variant="destructive">
        <AlertDescription>{error_text}</AlertDescription>
      </Alert>
    </div>
  );
}

export function CounterpartyShareWithState({
  loading,
  error,
  children,
}: Readonly<CategoryPartWithStateProps>) {
  let state: 'loading' | 'error' | 'success' = 'success';
  if (loading) {
    state = 'loading';
  } else if (error) {
    state = 'error';
  }

  return (
    <WithTransitionState
      state={state}
      data={true}
      loading={<CounterpartyShareSkeleton />}
      error={<CounterpartyShareError />}
    >
      {() => children}
    </WithTransitionState>
  );
}
