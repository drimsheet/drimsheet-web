import { Badge } from '@/shared/components/badge';
import { PageSection } from '@/shared/components/page-section';
import { PageTitle } from '@/shared/components/page-title';
import { Skeleton } from '@/shared/components/skeleton';
import { useTranslation } from 'react-i18next';
import helpers from '../helper';
import type { EntitySummaryProps } from '../types';

export function EntitySummary({
  entity,
  actions,
}: Readonly<EntitySummaryProps>) {
  const { t, i18n } = useTranslation('accounting');
  const country = helpers.jurisdiction(entity.jurisdictionCode);
  const currency = helpers.currency(entity.functionalCurrencyCode);
  const title = t('details_entity_title');
  const type_label = t(`details_type_${entity.type}`);
  const status_label = t(`details_status_${entity.status}`);
  const jurisdiction_label = t('details_jurisdiction_label');
  const currency_label = t('details_currency_label');
  const created_label = t('details_created_label');
  const updated_label = t('details_updated_label');

  return (
    <PageSection title={title} className="gap-6 py-0">
      <div className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 lg:grid-cols-[4rem_minmax(0,1fr)_auto] lg:gap-x-5">
        <div
          aria-hidden
          className="row-span-2 flex size-12 items-center justify-center rounded-lg bg-muted text-xl font-medium lg:size-16"
        >
          {helpers.initials(entity.name)}
        </div>
        <PageTitle className="col-start-2 break-words">{entity.name}</PageTitle>
        <div className="col-span-2 row-start-3 mt-3 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:mt-0">
          {actions}
        </div>
        <div className="col-start-2 row-start-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{type_label}</span>
          <Badge
            variant="ghost"
            className={
              entity.status === 'active'
                ? 'bg-success-surface text-success'
                : undefined
            }
          >
            {status_label}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:ml-21">
        <dl className="m-0 flex flex-wrap gap-x-8 gap-y-4">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">
              {jurisdiction_label}
            </dt>
            <dd className="m-0 flex items-center gap-2 text-sm">
              <span aria-hidden>{country.flag}</span>
              {country.name}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">{currency_label}</dt>
            <dd className="m-0 flex items-center gap-2 text-sm">
              <span aria-hidden>{currency.flag}</span>
              {currency.name}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span>
            {created_label}{' '}
            <time dateTime={entity.createdAt}>
              {helpers.formatDate(entity.createdAt, i18n.language)}
            </time>
          </span>
          <span>
            {updated_label}{' '}
            <time dateTime={entity.updatedAt}>
              {helpers.formatDate(entity.updatedAt, i18n.language)}
            </time>
          </span>
        </div>
      </div>
    </PageSection>
  );
}

export function EntitySummarySkeleton() {
  const { t } = useTranslation('accounting');
  const loading_label = t('details_loading_label');

  const details_entity_title = t('details_entity_title');

  return (
    <PageSection
      aria-busy="true"
      title={details_entity_title}
      className="gap-6 py-0"
    >
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <div className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 lg:grid-cols-[4rem_minmax(0,1fr)_auto] lg:gap-x-5">
        <Skeleton className="row-span-2 size-12 rounded-lg lg:size-16" />
        <Skeleton className="col-start-2 h-9 w-full max-w-80" />
        <Skeleton className="col-span-2 row-start-3 mt-3 h-9 w-24 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:mt-0" />
        <Skeleton className="col-start-2 row-start-2 h-5 w-full max-w-40" />
      </div>
      <div className="flex flex-col gap-4 lg:ml-21">
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          {[0, 1].map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-40" />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </PageSection>
  );
}
