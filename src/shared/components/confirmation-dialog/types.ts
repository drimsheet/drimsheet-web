import type { ButtonProps } from '@/shared/components/button';
import type { PropsWithChildren, ReactNode } from 'react';

export interface ConfirmationDialogProps extends PropsWithChildren {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The caller closes the dialog after confirmation succeeds. */
  onConfirm: () => void;
  /** Called when the cancel button is selected, before onClose. */
  onCancel?: () => void;
  /** Called on user dismissal, including cancellation and Escape. */
  onClose?: () => void;
  title: string;
  trigger: ReactNode;
  cancelText: string;
  confirmationText: string;
  variant?: ButtonProps['variant'];
  loading?: boolean;
  media?: ReactNode;
  footer?: ReactNode;
}
