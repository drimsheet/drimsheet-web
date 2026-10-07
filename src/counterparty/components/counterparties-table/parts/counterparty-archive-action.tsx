import { ConfirmationDialog } from '@/shared/components/confirmation-dialog';
import { DropdownMenuItem } from '@/shared/components/dropdown-menu';
import { Archive } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CounterpartyArchiveActionProps {
  disabled?: boolean;
  onSelect: () => void;
}

interface CounterpartyArchiveConfirmationProps {
  loading?: boolean;
  onArchive: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function CounterpartyArchiveAction({
  disabled = false,
  onSelect,
}: Readonly<CounterpartyArchiveActionProps>) {
  const { t } = useTranslation('counterparty');
  const archive_label = t('archive_label');

  return (
    <DropdownMenuItem
      disabled={disabled}
      onSelect={onSelect}
      variant="destructive"
    >
      <Archive aria-hidden="true" />
      {archive_label}
    </DropdownMenuItem>
  );
}

export function CounterpartyArchiveConfirmation({
  loading = false,
  onArchive,
  onOpenChange,
  open,
}: Readonly<CounterpartyArchiveConfirmationProps>) {
  const { t } = useTranslation('counterparty');
  const [submitting, setSubmitting] = useState(false);

  const busy = loading || submitting;

  const handleArchive = async () => {
    if (busy) return;

    setSubmitting(true);

    try {
      await onArchive();
      onOpenChange(false);
    } catch {
      // The orchestration owner presents the API error and keeps this open.
    } finally {
      setSubmitting(false);
    }
  };

  const confirmation_title = t('archive_confirmation_title');
  const confirmation_description = t('archive_confirmation_description');
  const confirmation_action = t('archive_confirmation_action');
  const archiving_label = t('archiving_label');
  const cancel_label = t('cancel_label');

  return (
    <ConfirmationDialog
      cancelText={cancel_label}
      confirmationText={busy ? archiving_label : confirmation_action}
      loading={busy}
      media={<Archive aria-hidden="true" className="text-destructive" />}
      onConfirm={handleArchive}
      onOpenChange={onOpenChange}
      open={open}
      title={confirmation_title}
      trigger={null}
      variant="destructive"
    >
      {confirmation_description}
    </ConfirmationDialog>
  );
}
