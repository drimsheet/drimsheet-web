import { Badge } from '@/shared/components/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/shared/components/empty';
import { RouteLink } from '@/shared/components/route-link';
import { Separator } from '@/shared/components/separator';
import { Skeleton } from '@/shared/components/skeleton';
import countries from '@/shared/configs/countries.json';
import { Building2, Check, Store, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LegalEntityListProps } from '../types';
import { LegalEntityActions } from './entity-actions';

const entityIcons = {
  individual: UserRound,
  sole_trader: Store,
  private_company: Building2,
};

export function LegalEntityList({
  entities,
  currentEntityId,
  getEntityHref,
}: Readonly<LegalEntityListProps>) {
  const { t } = useTranslation('accounting');

  const typeLabels = {
    individual: t('entity_type_individual_label'),
    sole_trader: t('legal_entities_type_sole_trader_label'),
    private_company: t('legal_entities_type_company_label'),
  };

  const list_label = t('legal_entities_list_label');
  const empty_title = t('legal_entities_empty_title');
  const empty_description = t('legal_entities_empty_description');
  const archived_label = t('legal_entities_archived_label');
  const current_label = t('legal_entities_current_label');

  if (!entities.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{empty_title}</EmptyTitle>
          <EmptyDescription>{empty_description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div>
      <Separator />
      <ul aria-label={list_label} className="m-0 list-none p-0">
        {entities.map((entity) => {
          const Icon = entityIcons[entity.type];
          const isCurrent = entity.id === currentEntityId;

          const country = countries.find(
            ({ code }) => code === entity.jurisdictionCode
          );

          const currency_label = t('legal_entities_currency_label', {
            currency: entity.functionalCurrencyCode,
          });

          return (
            <li key={entity.id}>
              <div className="flex items-center gap-3 py-5 md:gap-4 md:py-[22px]">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="m-0 break-words text-base font-medium [overflow-wrap:anywhere]">
                      <RouteLink to={getEntityHref(entity)} underline="none">
                        {entity.name}
                      </RouteLink>
                    </h3>
                    {isCurrent && (
                      <Badge variant="outline">
                        <Check aria-hidden />
                        {current_label}
                      </Badge>
                    )}
                    {entity.status === 'archived' && (
                      <Badge variant="outline">{archived_label}</Badge>
                    )}
                  </div>
                  <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span>{typeLabels[entity.type]}</span>
                    <span aria-hidden>·</span>
                    <span>{country?.name ?? entity.jurisdictionCode}</span>
                    <span aria-hidden>·</span>
                    <span aria-label={currency_label}>
                      {entity.functionalCurrencyCode}
                    </span>
                  </p>
                </div>
                <LegalEntityActions
                  entityName={entity.name}
                  isCurrent={isCurrent}
                />
              </div>
              <Separator />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function LegalEntityListSkeleton() {
  const { t } = useTranslation('accounting');
  const loading_label = t('legal_entities_loading_label');

  return (
    <div aria-busy="true">
      <output className="sr-only" aria-label={loading_label} aria-busy="true">
        {loading_label}
      </output>
      <ul>
        {[0, 1, 2].map((row) => (
          <li key={row}>
            <div className="flex items-center gap-3 py-5 md:gap-4 md:py-[22px]">
              <Skeleton className="size-10 shrink-0 rounded-md" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Skeleton className="h-6 w-full max-w-40" />
                <Skeleton className="h-4 w-full max-w-56" />
              </div>
              <Skeleton className="size-8 shrink-0" />
            </div>
            <Separator />
          </li>
        ))}
      </ul>
    </div>
  );
}
