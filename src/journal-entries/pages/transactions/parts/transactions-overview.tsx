import { Alert, AlertDescription, AlertTitle } from '@/shared/components/alert';
import { CurrencyLogo } from '@/shared/components/currency-logo';
import { Empty, EmptyDescription } from '@/shared/components/empty';
import { Money } from '@/shared/components/money';
import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import { useTranslation } from 'react-i18next';
import type {
  TransactionsOverviewProps,
  TransactionsOverviewWithStateProps,
} from '../types';

export function TransactionsOverview({
  inflow,
  outflow,
  currencies,
}: Readonly<TransactionsOverviewProps>) {
  const { t } = useTranslation('journal-entries');
  const inflow_label = t('inflow_tab');
  const outflow_label = t('outflow_tab');
  const currencies_title = t('overview_currencies_title');
  const empty_text = t('overview_empty_text');

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
      <dl className="grid min-w-0 grid-cols-2 gap-6 py-2">
        <div className="flex min-w-0 flex-col gap-3">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden
              className="size-2.5 rounded-xs bg-financial-income"
            />
            {inflow_label}
          </dt>
          <dd className="m-0 text-3xl font-medium tracking-tight tabular-nums wrap-anywhere">
            <Money value={inflow} isConverted />
          </dd>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              aria-hidden
              className="size-2.5 rounded-xs bg-financial-expense"
            />
            {outflow_label}
          </dt>
          <dd className="m-0 text-3xl font-medium tracking-tight tabular-nums wrap-anywhere">
            <Money value={outflow} isConverted />
          </dd>
        </div>
      </dl>
      <section
        aria-label={currencies_title}
        className="flex min-w-0 flex-col gap-5 lg:border-l lg:pl-8"
      >
        <h3 className="m-0 text-sm font-medium text-muted-foreground">
          {currencies_title}
        </h3>
        {currencies.length === 0 && (
          <Empty>
            <EmptyDescription>{empty_text}</EmptyDescription>
          </Empty>
        )}
        <dl className="m-0 flex flex-wrap gap-x-10 gap-y-6">
          {currencies.map((currency) => (
            <div
              key={currency.currencyCode}
              className="flex min-w-0 items-center gap-3"
            >
              <dt>
                <span className="sr-only">{currency.currencyCode}</span>
                <CurrencyLogo
                  aria-hidden
                  url={currency.logo}
                  className="size-8"
                />
              </dt>
              <dd className="m-0 flex flex-col gap-1 text-sm font-medium tabular-nums">
                <span className="text-financial-income">
                  <span className="sr-only">{inflow_label}: </span>
                  {currency.inflow.amount > 0 && '+'}
                  <Money value={currency.inflow} />
                </span>
                <span className="text-financial-expense">
                  <span className="sr-only">{outflow_label}: </span>
                  {currency.outflow.amount > 0 && '+'}
                  <Money value={currency.outflow} />
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export function TransactionsOverviewSkeleton() {
  const { t } = useTranslation('journal-entries');
  const loading_label = t('overview_loading_status');

  return (
    <div
      aria-busy="true"
      className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8"
    >
      <output className="sr-only" aria-label={loading_label}>
        {loading_label}
      </output>
      <div className="grid min-w-0 grid-cols-2 gap-6 py-2">
        {[0, 1].map((key) => (
          <div key={key} className="flex min-w-0 flex-col gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-9 w-full max-w-40" />
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-col gap-5 lg:border-l lg:pl-8">
        <Skeleton className="h-5 w-44" />
        <div className="flex flex-wrap gap-x-10 gap-y-6">
          {[0, 1, 2].map((key) => (
            <div key={key} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TransactionsOverviewError() {
  const { t } = useTranslation('journal-entries');
  const error_title = t('overview_error_title');
  const error_description = t('overview_error_description');

  return (
    <Alert variant="destructive">
      <AlertTitle>{error_title}</AlertTitle>
      <AlertDescription>{error_description}</AlertDescription>
    </Alert>
  );
}

export function TransactionsOverviewWithState({
  state,
  data,
}: Readonly<TransactionsOverviewWithStateProps>) {
  return (
    <WithTransitionState
      state={state}
      data={{ overview: data }}
      loading={<TransactionsOverviewSkeleton />}
      error={<TransactionsOverviewError />}
    >
      {({ overview }) =>
        overview ? (
          <TransactionsOverview {...overview} />
        ) : (
          <TransactionsOverviewError />
        )
      }
    </WithTransitionState>
  );
}
