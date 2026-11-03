import { Alert, AlertDescription } from '@/shared/components/alert';
import { Skeleton } from '@/shared/components/skeleton';
import { BriefcaseBusiness, Building2, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CounterpartyOverviewProps } from '../types';

export function CounterpartyOverview({
  employers,
  vendors,
  contractors,
}: Readonly<CounterpartyOverviewProps>) {
  const { t, i18n } = useTranslation('counterparty');
  const formatter = new Intl.NumberFormat(i18n.language);

  const totals = [
    { label: t('total_employers_label'), value: employers, icon: Building2 },
    { label: t('total_vendors_label'), value: vendors, icon: Store },
    {
      label: t('total_contractors_label'),
      value: contractors,
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <dl className="grid min-w-0 grid-cols-3 divide-x divide-border py-2">
      {totals.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex min-w-0 flex-col gap-3 px-3 first:pl-0 last:pr-0 md:px-6"
        >
          <dt className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Icon aria-hidden className="hidden size-4 shrink-0 sm:block" />
            {label}
          </dt>
          <dd className="m-0 text-3xl font-medium tracking-tight tabular-nums break-all md:text-4xl">
            {formatter.format(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CounterpartyOverviewSkeleton() {
  const { t } = useTranslation('counterparty');
  const loading_text = t('overview_loading_text');

  return (
    <div
      aria-busy="true"
      className="grid min-w-0 grid-cols-3 divide-x divide-border py-2"
    >
      <output className="sr-only">{loading_text}</output>
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="flex min-w-0 flex-col gap-3 px-3 first-of-type:pl-0 last:pr-0 md:px-6"
        >
          <Skeleton className="h-5 w-full max-w-36" />
          <Skeleton className="h-9 w-16 max-w-full md:h-10" />
        </div>
      ))}
    </div>
  );
}

export function CounterpartyOverviewError() {
  const { t } = useTranslation('counterparty');
  const error_text = t('overview_load_error_text');

  return (
    <Alert variant="destructive">
      <AlertDescription>{error_text}</AlertDescription>
    </Alert>
  );
}
