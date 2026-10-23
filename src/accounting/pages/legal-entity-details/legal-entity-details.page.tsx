import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { AppBody } from '@/shared/components/app';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/breadcrumb';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from '@/shared/components/empty';
import { PageSection } from '@/shared/components/page-section';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import helpers from './helper';
import { useEntityDetails } from './hooks/use-entity-details';
import { useFiscalYearContext } from './hooks/use-fiscal-year-context';
import { useFiscalYears } from './hooks/use-fiscal-years';
import { ContextDetails } from './parts/context-details';
import { EntityActionsContainer } from './parts/entity-actions.container';
import { EntitySummary } from './parts/entity-summary';
import { FiscalYearSummary } from './parts/fiscal-year-summary';
import { SectionError } from './parts/section-error';
import { EntityDetailsSkeleton } from './parts/skeleton';

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
    <AppBody>
      <div className="flex min-w-0 flex-col gap-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/legal-entity">{list_title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="break-words">
                {entity.data?.name ?? page_title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {entity.isPending && <EntityDetailsSkeleton />}
        {entity.isError && (
          <SectionError
            pending={entity.isFetching}
            onRetry={() => void entity.refetch()}
          />
        )}
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
            <PageSection title={context_title} className="gap-6 py-0">
              {years.isPending && <EntityDetailsSkeleton />}
              {years.isError && (
                <SectionError
                  pending={years.isFetching}
                  onRetry={() => void years.refetch()}
                />
              )}
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
                  {context.isPending && <EntityDetailsSkeleton />}
                  {context.isError && (
                    <SectionError
                      pending={context.isFetching}
                      onRetry={() => void context.refetch()}
                    />
                  )}
                  {context.data && (
                    <ContextDetails context={context.data} now={now} />
                  )}
                </>
              )}
            </PageSection>
          </>
        )}
      </div>
    </AppBody>
  );
}
