import { Alert, AlertDescription } from '@/shared/components/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/alert-dialog';
import { Button } from '@/shared/components/button';
import { useTranslation } from 'react-i18next';
import type { CategoryArchiveConfirmationProps } from '../types';

export function CategoryArchiveConfirmation({
  account,
  pending,
  error,
  onClose,
  onConfirm,
}: Readonly<CategoryArchiveConfirmationProps>) {
  const { t } = useTranslation('ledger-accounts');
  const title = t('categories_archive_title');

  const description = t('categories_archive_description', {
    name: account?.accountName,
  });

  const cancel_label = t('categories_cancel_label');
  const archive_label = t('categories_archive_label');
  const error_text = t('categories_archive_error_text');

  const handleOpenChange = (open: boolean) => {
    if (!open && !pending) onClose();
  };

  return (
    <AlertDialog open={!!account} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error_text}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {cancel_label}
          </AlertDialogCancel>
          <Button onClick={onConfirm} loading={pending}>
            {archive_label}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
