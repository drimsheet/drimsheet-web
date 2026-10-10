import {
  AlertDialogAction,
  AlertDialogCancel,
} from '@/shared/components/alert-dialog';
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog';
import { Input } from '@/shared/components/input';
import { Label } from '@/shared/components/label';
import { Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CounterpartyDeleteConfirmationProps } from '../types';

export function CounterpartyDeleteConfirmation({
  counterpartyName,
  onDelete,
  onOpenChange,
  open,
}: Readonly<CounterpartyDeleteConfirmationProps>) {
  const { t } = useTranslation('counterparty');
  const confirmationInputId = useId();
  const [confirmationText, setConfirmationText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const confirmation_keyword = t('delete_confirmation_keyword');
  const isDeleteConfirmed = confirmationText === confirmation_keyword;

  const handleOpenChange = (nextOpen: boolean) => {
    if (submitting) return;

    onOpenChange(nextOpen);
    if (!nextOpen) setConfirmationText('');
  };

  const handleDelete = async () => {
    if (submitting || !isDeleteConfirmed) return;

    setSubmitting(true);

    try {
      await onDelete();
    } finally {
      setSubmitting(false);
      setConfirmationText('');
    }
  };

  const delete_label = t('delete_label');
  const deleting_label = t('deleting_label');
  const confirmation_title = t('delete_confirmation_title');

  const confirmation_description = t('delete_confirmation_description', {
    name: counterpartyName,
  });

  const confirmation_input_label = t('delete_confirmation_input_label');
  const cancel_label = t('cancel_label');

  const footer = (
    <>
      <AlertDialogCancel disabled={submitting} size="sm">
        {cancel_label}
      </AlertDialogCancel>
      <AlertDialogAction
        disabled={submitting || !isDeleteConfirmed}
        loading={submitting}
        onClick={handleDelete}
        size="sm"
        variant="destructive"
      >
        {submitting ? deleting_label : delete_label}
      </AlertDialogAction>
    </>
  );

  return (
    <ConfirmationDialog
      cancelText={cancel_label}
      confirmationText={delete_label}
      footer={footer}
      loading={submitting}
      media={<Trash2 aria-hidden="true" className="text-destructive" />}
      onConfirm={handleDelete}
      onOpenChange={handleOpenChange}
      open={open}
      title={confirmation_title}
      trigger={null}
      variant="destructive"
    >
      <span>{confirmation_description}</span>
      <span className="mt-4 flex flex-col gap-2 text-left">
        <Label htmlFor={confirmationInputId}>{confirmation_input_label}</Label>
        <Input
          autoComplete="off"
          disabled={submitting}
          id={confirmationInputId}
          onChange={(event) => setConfirmationText(event.target.value)}
          spellCheck={false}
          value={confirmationText}
        />
      </span>
    </ConfirmationDialog>
  );
}
