import { useArchiveLedgerAccount } from '@/account/hooks/use-archive-ledger-account';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { AccountActionsContainerProps } from '../types';
import { AccountActions } from './account-actions';

export function AccountActionsContainer({
  account,
}: Readonly<AccountActionsContainerProps>) {
  const { t } = useTranslation('ledger-accounts');
  const handleApiError = useApiErrorHandler();
  const { mutateAsync: archive, isPending } = useArchiveLedgerAccount();

  const handleArchive = async () => {
    try {
      await archive(account.id);
      toast.success(t('account_archived_success_text'));
    } catch (error) {
      handleApiError(error, { showToast: true });
      throw error;
    }
  };

  return (
    <AccountActions
      archiveDisabled={
        account.status === 'archived' || !account.controlAccountId
      }
      isControlAccount={account.isControlAccount}
      loading={isPending}
      onArchive={handleArchive}
    />
  );
}
