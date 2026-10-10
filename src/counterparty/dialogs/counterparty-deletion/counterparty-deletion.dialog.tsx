import { useDeleteCounterparty } from '@/counterparty/hooks/use-delete-counterparty';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CounterpartyDeleteConfirmation } from './parts/counterparty-delete-confirmation';
import type { CounterpartyDeletionDialogProps } from './types';

export function CounterpartyDeletionDialog({
  counterparty,
  onClose,
  onDeleted,
}: Readonly<CounterpartyDeletionDialogProps>) {
  const { t } = useTranslation('counterparty');
  const handleApiError = useApiErrorHandler();
  const { mutateAsync: deleteCounterparty } = useDeleteCounterparty();

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleDelete = async () => {
    if (!counterparty) return;

    let deleted = false;

    try {
      await deleteCounterparty(counterparty.id);
      toast.success(t('counterparty_deleted_success_text'));
      deleted = true;
    } catch (error) {
      handleApiError(error, { showToast: true });
    } finally {
      onClose();
    }

    if (deleted) onDeleted?.(counterparty.id);
  };

  if (!counterparty) return null;

  return (
    <CounterpartyDeleteConfirmation
      counterpartyName={counterparty.name}
      onDelete={handleDelete}
      onOpenChange={handleOpenChange}
      open
    />
  );
}
