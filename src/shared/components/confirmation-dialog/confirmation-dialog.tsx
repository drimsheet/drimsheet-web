import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/alert-dialog';
import type { MouseEvent } from 'react';
import type { ConfirmationDialogProps } from './types';

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  onClose,
  trigger,
  title,
  cancelText,
  confirmationText,
  variant = 'default',
  loading = false,
  children,
  media,
  footer,
}: Readonly<ConfirmationDialogProps>) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (loading) return;

    onOpenChange(nextOpen);

    if (!nextOpen) onClose?.();
  };

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!loading) onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          {media && <AlertDialogMedia>{media}</AlertDialogMedia>}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{children}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {footer ?? (
            <>
              <AlertDialogCancel
                disabled={loading}
                size="sm"
                onClick={onCancel}
              >
                {cancelText}
              </AlertDialogCancel>
              <AlertDialogAction
                variant={variant}
                size="sm"
                onClick={handleConfirm}
                loading={loading}
              >
                {confirmationText}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
