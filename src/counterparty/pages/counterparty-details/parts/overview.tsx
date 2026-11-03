import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { useTranslation } from 'react-i18next';
import type { OverviewProps, OverviewWithStateProps } from '../types';

export function Overview({ participation }: Readonly<OverviewProps>) {
  const { t } = useTranslation('counterparty');
  const income_label = t('details_total_income_label');
  const expenses_label = t('details_total_expenses_label');

  const metrics = [
    {
      label: income_label,
      value: participation.revenue,
      color: 'bg-financial-income',
    },
    {
      label: expenses_label,
      value: participation.expense,
      color: 'bg-financial-expense',
    },
  ];

  return (
    <dl className="grid min-w-0 gap-8 sm:grid-cols-2">
      {metrics.map(({ label, value, color }) => (
        <div key={label} className="flex min-w-0 flex-col gap-3">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden="true"
              className={`size-2 shrink-0 rounded-sm ${color}`}
            />
            {label}
          </dt>
          <dd>
            <Money
              value={value}
              className="text-3xl font-medium tracking-tight tabular-nums wrap-anywhere"
            />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function OverviewSkeleton() {
  const { t } = useTranslation('counterparty');
  const loading_label = t('details_overview_loading_text');

  return (
    <div className="flex min-w-0 flex-col gap-6" aria-busy="true">
      <output className="sr-only">{loading_label}</output>
      <div className="grid min-w-0 gap-8 sm:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="flex min-w-0 flex-col gap-3">
            <Skeleton className="h-5 w-32 max-w-full" />
            <Skeleton className="h-9 w-56 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewError() {
  const { t } = useTranslation('counterparty');
  const error_text = t('details_overview_error_text');

  return (
    <p role="alert" className="text-sm text-muted-foreground">
      {error_text}
    </p>
  );
}

export function OverviewWithState({
  loading,
  error,
  participation,
}: Readonly<OverviewWithStateProps>) {
  let state: 'loading' | 'error' | 'success' = 'success';
  if (loading) {
    state = 'loading';
  } else if (error || !participation) {
    state = 'error';
  }

  return (
    <WithTransitionState
      state={state}
      data={true}
      loading={<OverviewSkeleton />}
      error={<OverviewError />}
    >
      {() => participation && <Overview participation={participation} />}
    </WithTransitionState>
  );
}
