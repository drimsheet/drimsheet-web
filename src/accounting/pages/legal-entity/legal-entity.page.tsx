import { AccountingEntityCreationDialog } from '@/accounting/dialogs/accounting-entity-creation';
import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { Alert, AlertDescription } from '@/shared/components/alert';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { Button } from '@/shared/components/button';
import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LegalEntityList, LegalEntityListSkeleton } from './parts/entity-list';

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

  return (
    <AppBody
      title={title}
      actionsSlot={
        <Button
          ref={addButtonRef}
          type="button"
          size="lg"
          onClick={() => setShowCreation(true)}
        >
          <Plus data-icon="inline-start" aria-hidden />
          {add_label}
        </Button>
      }
    >
      <div className="flex min-w-0 flex-col">
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <AppSection
          aria-label={section_title}
          title={entities.data ? section_count : section_title}
        >
          {entities.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>{refresh_error}</span>
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
        </AppSection>
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
