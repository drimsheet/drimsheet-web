import {
  LegalEntityActionDialog,
  type LegalEntityActionDialogProps,
} from '@/accounting/dialogs/legal-entity-action';
import { accountingService } from '@/accounting/lib/services/accounting.service';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useRef, useState } from 'react';
import type { EntityActionsContainerProps } from '../types';
import { EntityActions } from './entity-actions';

export function EntityActionsContainer({
  entity,
  isCurrent,
}: Readonly<EntityActionsContainerProps>) {
  const [action, setAction] =
    useState<LegalEntityActionDialogProps['action']>();

  const [switching, setSwitching] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const handleApiError = useApiErrorHandler();

  const handleSwitch = async () => {
    if (switching) {
      return;
    }

    setSwitching(true);
    try {
      await accountingService.switchAccountingEntity({
        accountingEntityId: entity.id,
      });
      accountingService.prepareAccountingEntityReload();
      window.location.reload();
    } catch (error) {
      handleApiError(error, { showToast: true });
      setSwitching(false);
    }
  };

  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    actionsRef.current
      ?.querySelector<HTMLButtonElement>(
        action === 'edit' ? 'button' : '[data-slot="dropdown-menu-trigger"]'
      )
      ?.focus();
  };

  return (
    <div ref={actionsRef}>
      <EntityActions
        isCurrent={isCurrent}
        archived={entity.status === 'archived'}
        pending={switching}
        onEdit={() => setAction('edit')}
        onArchive={() => setAction('archive')}
        onDelete={() => setAction('delete')}
        onSwitch={() => void handleSwitch()}
      />
      {action && (
        <LegalEntityActionDialog
          entity={entity}
          isCurrent={isCurrent}
          action={action}
          onClose={() => setAction(undefined)}
          onCloseAutoFocus={handleCloseAutoFocus}
        />
      )}
    </div>
  );
}
