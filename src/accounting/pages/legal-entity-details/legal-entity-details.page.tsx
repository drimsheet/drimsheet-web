import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { useEntityDetails } from '@/accounting/hooks/use-entity-details';
import { useFiscalYearContext } from '@/accounting/hooks/use-fiscal-year-context';
import { useFiscalYears } from '@/accounting/hooks/use-fiscal-years';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from '@/shared/components/empty';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import helpers from './helper';
import {
  ContextDetails,
  ContextDetailsSkeleton,
} from './parts/context-details';
import { EntityActionsContainer } from './parts/entity-actions.container';
import { EntitySummary, EntitySummarySkeleton } from './parts/entity-summary';
import {
  FiscalYearSummary,
  FiscalYearSummarySkeleton,
} from './parts/fiscal-year-summary';
import { SectionError } from './parts/section-error';

export function LegalEntityDetailsPage() {
  const { entityId = '' } = useParams();
  const { t } = useTranslation('accounting');
  const [selectedId, setSelectedId] = useState<string>();
  const [now] = useState(() => Date.now());
  const entity = useEntityDetails(entityId);
  const { data: currentEntity } = useAccountingEntity();
  const years = useFiscalYears(entity.data ? entityId : '');
  const selected = helpers.selectFiscalYear(years.data ?? [], selectedId, now);

  const context = useFiscalYearContext(
    entity.data ? entityId : '',
    selected?.id ?? ''
  );

  const list_title = t('legal_entities_title');
  const page_title = t('legal_entity_details_title');
  const context_title = t('details_context_title');
  const no_years = t('details_no_fiscal_years');

  return (
    <AppBody
      breadcrumbs={{
        label: list_title,
        link: '/legal-entity',
        next: { label: entity.data?.name ?? page_title },
      }}
    >
      <div className="mt-7 flex min-w-0 flex-col gap-10">
        {entity.isPending && <EntitySummarySkeleton />}
        {entity.isError && <SectionError />}
        {entity.data && (
          <>
            <EntitySummary
              entity={entity.data}
              actions={
                <EntityActionsContainer
                  entity={entity.data}
                  isCurrent={currentEntity?.id === entityId}
                />
              }
            />
            <AppSection title={context_title} className="gap-6 py-0">
              {years.isPending && <FiscalYearSummarySkeleton />}
              {years.isError && <SectionError />}
              {years.data?.length === 0 && (
                <Empty>
                  <EmptyHeader>
                    <EmptyDescription>{no_years}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              {selected && (
                <>
                  <FiscalYearSummary
                    years={years.data ?? []}
                    selected={selected}
                    onChange={setSelectedId}
                  />
                  {context.isPending && <ContextDetailsSkeleton />}
                  {context.isError && <SectionError />}
                  {context.data && (
                    <ContextDetails context={context.data} now={now} />
                  )}
                </>
              )}
            </AppSection>
          </>
        )}
      </div>
    </AppBody>
  );
}
