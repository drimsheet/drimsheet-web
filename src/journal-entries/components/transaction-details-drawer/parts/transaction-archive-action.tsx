import { Button } from '@/shared/components/button';
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog';
import { Archive } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TransactionArchiveActionProps {
  loading?: boolean;
  onArchive?: () => Promise<void> | void;
}

export function TransactionArchiveAction({
  loading = false,
  onArchive,
}: Readonly<TransactionArchiveActionProps>) {
  const { t } = useTranslation('journal-entries');
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const busy = loading || submitting;

  const handleArchive = async () => {
    if (busy || !onArchive) {
      return;
    }

    setSubmitting(true);
    try {
      await onArchive();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const archive_label = t('archive_entry_label');
  const confirmation_title = t('archive_entry_confirmation_title');
  const confirmation_description = t('archive_entry_confirmation_description');
  const cancel_text = t('archive_entry_cancel_text');

  return (
    <ConfirmationDialog
      cancelText={cancel_text}
      confirmationText={archive_label}
      loading={busy}
      media={<Archive aria-hidden="true" />}
      onConfirm={handleArchive}
      onOpenChange={setOpen}
      open={open}
      title={confirmation_title}
      trigger={
        <Button disabled={!onArchive || busy} type="button" variant="outline">
          <Archive aria-hidden="true" data-icon="inline-start" />
          {archive_label}
        </Button>
      }
    >
      {confirmation_description}
    </ConfirmationDialog>
  );
}
