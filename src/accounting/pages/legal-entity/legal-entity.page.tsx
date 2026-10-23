import { AccountingEntityCreationDialog } from '@/accounting/dialogs/accounting-entity-creation';
import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { AppBody, AppHeaderTitle } from '@/shared/components/app';
import { Button } from '@/shared/components/button';
import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LegalEntityList } from './parts/entity-list';
import { LegalEntityListSkeleton } from './parts/skeleton';

export function LegalEntityPage() {
  const { t } = useTranslation('accounting');
  const [showCreation, setShowCreation] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const entities = useAccountingEntities();
  const { data: currentEntity } = useAccountingEntity();

  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    addButtonRef.current?.focus();
  };

  const title = t('legal_entities_title');
  const description = t('legal_entities_description');
  const add_label = t('legal_entities_add_label');
  const section_title = t('legal_entities_section_title');

  const section_count = t('legal_entities_section_count', {
    count: entities.data?.length ?? 0,
  });

  const refresh_error = t('legal_entities_refresh_error');
  const retry_label = t('legal_entities_retry_label');

  return (
    <AppBody>
      <div className="flex min-w-0 flex-col gap-8 md:gap-12">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex min-w-0 flex-col gap-2.5">
            <AppHeaderTitle className="m-0">{title}</AppHeaderTitle>
            <p className="m-0 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            ref={addButtonRef}
            type="button"
            size="lg"
            onClick={() => setShowCreation(true)}
          >
            <Plus data-icon="inline-start" aria-hidden />
            {add_label}
          </Button>
        </header>
        <section
          aria-label={section_title}
          className="flex min-w-0 flex-col gap-4"
        >
          <h2 className="m-0 text-xs font-medium uppercase tracking-[0.07em] text-muted-foreground">
            {entities.data ? section_count : section_title}
          </h2>
          {entities.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>{refresh_error}</span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={entities.isFetching}
                    onClick={() => void entities.refetch()}
                  >
                    {retry_label}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          {entities.isPending && <LegalEntityListSkeleton />}
          {entities.data && (
            <LegalEntityList
              entities={entities.data}
              currentEntityId={currentEntity?.id}
              getEntityHref={(entity) =>
                `/legal-entity/${encodeURIComponent(entity.id)}`
              }
            />
          )}
        </section>
      </div>
      {showCreation && (
        <AccountingEntityCreationDialog
          onClose={() => setShowCreation(false)}
          onCloseAutoFocus={handleCloseAutoFocus}
        />
      )}
    </AppBody>
  );
}
