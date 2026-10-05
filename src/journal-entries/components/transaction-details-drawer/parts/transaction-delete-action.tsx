import {
  AlertDialogAction,
  AlertDialogCancel,
} from '@/shared/components/alert-dialog';
import { Button } from '@/shared/components/button';
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Trash2 } from 'lucide-react';
import { type MouseEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TransactionDeleteActionProps {
  disabled?: boolean;
  onArchive?: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

export function TransactionDeleteAction({
  disabled = false,
  onArchive,
  onDelete,
}: Readonly<TransactionDeleteActionProps>) {
  const { t } = useTranslation('journal-entries');
  const confirmationInputId = useId();
  const [open, setOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const [pendingAction, setPendingAction] = useState<
    'archive' | 'delete' | null
  >(null);

  const confirmation_keyword = t('delete_entry_confirmation_keyword');
  const isDeleteConfirmed = confirmationText === confirmation_keyword;
  const busy = pendingAction !== null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (busy) return;

    setOpen(nextOpen);
    if (!nextOpen) setConfirmationText('');
  };

  const handleArchive = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!onArchive || busy) return;

    setPendingAction('archive');
    try {
      await onArchive();
      setOpen(false);
      setConfirmationText('');
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    if (!isDeleteConfirmed || busy) return;

    setPendingAction('delete');
    try {
      await onDelete?.();
      setOpen(false);
      setConfirmationText('');
    } catch {
      // The caller presents the API error; keep the confirmation open for retry.
    } finally {
      setPendingAction(null);
    }
  };

  const delete_label = t('delete_entry_label');
  const deleting_text = t('delete_entry_loading_text');
  const confirmation_title = t('delete_entry_confirmation_title');
  const confirmation_description = t('delete_entry_confirmation_description');
  const confirmation_input_label = t('delete_entry_confirmation_input_label');
  const cancel_text = t('archive_entry_cancel_text');
  const archive_instead_text = t('delete_entry_archive_instead_text');
  const archiving_text = t('archive_entry_loading_text');

  const footer = (
    <>
      <AlertDialogCancel disabled={busy} size="sm">
        {cancel_text}
      </AlertDialogCancel>
      <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
        <AlertDialogAction
          disabled={busy || !onArchive}
          loading={pendingAction === 'archive'}
          onClick={handleArchive}
          size="sm"
          variant="outline"
        >
          {pendingAction === 'archive' ? archiving_text : archive_instead_text}
        </AlertDialogAction>
        <AlertDialogAction
          disabled={busy || !isDeleteConfirmed}
          loading={pendingAction === 'delete'}
          onClick={handleDelete}
          size="sm"
          variant="destructive"
        >
          {pendingAction === 'delete' ? deleting_text : delete_label}
        </AlertDialogAction>
      </div>
    </>
  );

  return (
    <ConfirmationDialog
      cancelText={cancel_text}
      confirmationText={delete_label}
      footer={footer}
      loading={busy}
      media={<Trash2 aria-hidden="true" className="text-destructive" />}
      onConfirm={handleDelete}
      onOpenChange={handleOpenChange}
      open={open}
      title={confirmation_title}
      trigger={
        <Button disabled={disabled} type="button" variant="destructive">
          {delete_label}
        </Button>
      }
      variant="destructive"
    >
      <span>{confirmation_description}</span>
      <span className="mt-4 flex flex-col gap-2 text-left">
        <Label htmlFor={confirmationInputId}>{confirmation_input_label}</Label>
        <Input
          autoComplete="off"
          disabled={busy}
          id={confirmationInputId}
          onChange={(event) => setConfirmationText(event.target.value)}
          spellCheck={false}
          value={confirmationText}
        />
      </span>
    </ConfirmationDialog>
  );
}
