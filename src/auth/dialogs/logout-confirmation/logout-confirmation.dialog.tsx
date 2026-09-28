import { useLogout } from '@/auth/hooks/use-logout';
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { LogOutIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface LogoutConfirmationDialogProps {
  children?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export function LogoutConfirmationDialog({
  children,
  onOpenChange,
  open,
}: Readonly<LogoutConfirmationDialogProps>) {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const handleApiError = useApiErrorHandler();
  const [internalOpen, setInternalOpen] = useState(false);
  const { mutateAsync: logout, isPending } = useLogout();

  const isOpen = open ?? internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleOpenChange(false);
      navigate('/auth/signin', { replace: true });
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const are_you_sure_logout_text = t('are_you_sure_logout_text');
  const will_need_to_log_back_in_text = t('will_need_to_log_back_in_text');
  const cancel_text = t('cancel_text');
  const logging_out_text = t('logging_out_text');
  const log_out_text = t('log_out_text');

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      onConfirm={handleLogout}
      title={are_you_sure_logout_text}
      trigger={children}
      cancelText={cancel_text}
      confirmationText={isPending ? logging_out_text : log_out_text}
      variant="destructive"
      loading={isPending}
      media={<LogOutIcon className="text-destructive" />}
    >
      {will_need_to_log_back_in_text}
    </ConfirmationDialog>
  );
}
