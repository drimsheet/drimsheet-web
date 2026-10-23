import { useAccountingContexts } from '@/accounting/hooks/use-accounting-contexts';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { useReportingContexts } from '@/accounting/hooks/use-reporting-contexts';
import { AppBody } from '@/shared/components/app';
import { useTranslation } from 'react-i18next';
import { AccountingContextDetails } from './parts/accounting-context-details';
import { EntityDetails } from './parts/entity-details';
import { ReportingContextDetails } from './parts/reporting-context-details';
import { SectionState } from './parts/section-state';

export function LegalEntityPage() {
  const { t } = useTranslation('accounting');
  const entityQuery = useAccountingEntity({ throwOnError: false });
  const entity = entityQuery.data;
  const accountingQuery = useAccountingContexts(entity?.id);
  const reportingQuery = useReportingContexts(entity?.id);
  const accountingContexts = accountingQuery.data;
  const reportingContexts = reportingQuery.data;

  const page_title = t('legal_entity_title');
  const page_description = t('legal_entity_description');
  const details_title = t('legal_entity_details_title');
  const accounting_title = t('legal_entity_accounting_title');
  const accounting_description = t('legal_entity_accounting_description');
  const reporting_title = t('legal_entity_reporting_title');
  const reporting_description = t('legal_entity_reporting_description');

  return (
    <>
      <AppBody>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-1 pb-6 sm:px-4">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-3xl font-semibold tracking-tight">
              {page_title}
            </h1>
            <p className="text-sm text-muted-foreground">{page_description}</p>
          </div>
          {entity ? (
            <EntityDetails entity={entity} />
          ) : (
            <SectionState
              label={details_title}
              state={entityQuery.isPending ? 'loading' : 'error'}
              onRetry={() => void entityQuery.refetch()}
            />
          )}
          {entity && (
            <div className="grid items-start gap-8 xl:grid-cols-2">
              <section
                aria-labelledby="accounting-context-title"
                className="flex min-w-0 flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <h2
                    id="accounting-context-title"
                    className="m-0 text-lg font-semibold"
                  >
                    {accounting_title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {accounting_description}
                  </p>
                </div>
                {!accountingContexts && (
                  <SectionState
                    label={accounting_title}
                    state={accountingQuery.isPending ? 'loading' : 'error'}
                    onRetry={() => void accountingQuery.refetch()}
                  />
                )}
                {accountingContexts?.length === 0 && (
                  <SectionState label={accounting_title} state="empty" />
                )}
                {accountingContexts?.map((context) => (
                  <AccountingContextDetails
                    key={context.id}
                    context={context}
                  />
                ))}
              </section>
              <section
                aria-labelledby="reporting-context-title"
                className="flex min-w-0 flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <h2
                    id="reporting-context-title"
                    className="m-0 text-lg font-semibold"
                  >
                    {reporting_title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {reporting_description}
                  </p>
                </div>
                {!reportingContexts && (
                  <SectionState
                    label={reporting_title}
                    state={reportingQuery.isPending ? 'loading' : 'error'}
                    onRetry={() => void reportingQuery.refetch()}
                  />
                )}
                {reportingContexts?.length === 0 && (
                  <SectionState label={reporting_title} state="empty" />
                )}
                {reportingContexts?.map((context) => (
                  <ReportingContextDetails key={context.id} context={context} />
                ))}
              </section>
            </div>
          )}
        </div>
      </AppBody>
    </>
  );
}
