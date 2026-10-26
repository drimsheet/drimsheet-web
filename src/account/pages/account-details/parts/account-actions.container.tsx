import { AccountDeleteConfirmation } from '@/account/components/account-delete-confirmation';
import { AccountUpdateDialog } from '@/account/dialogs/account-update';
import { useArchiveLedgerAccount } from '@/account/hooks/use-archive-ledger-account';
import { useDeleteLedgerAccount } from '@/account/hooks/use-delete-ledger-account';
import { useLedgerAccountDeletionEligibility } from '@/account/hooks/use-ledger-account-deletion-eligibility';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { AccountActionsContainerProps } from '../types';
import { AccountActions } from './account-actions';

export function AccountActionsContainer({
  account,
}: Readonly<AccountActionsContainerProps>) {
  const { t } = useTranslation('ledger-accounts');
  const navigate = useNavigate();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);
  const handleApiError = useApiErrorHandler();
  const { mutateAsync: archive, isPending } = useArchiveLedgerAccount();
  const { mutateAsync: deleteAccount } = useDeleteLedgerAccount();

  const eligibility = useLedgerAccountDeletionEligibility(
    account.id,
    actionsOpen
  );

  const handleOpenDelete = () => {
    if (
      eligibility.isSuccess &&
      !eligibility.isFetching &&
      eligibility.data.canDelete
    ) {
      setDeleteOpen(true);
    }
  };

  const handleEdit = () => {
    try {
      if (account.behavior !== 'bank' && account.behavior !== 'petty_cash') {
        throw new Error(t('account_not_editable_error_text'));
      }

      if (account.status === 'archived') {
        throw new Error(t('archived_account_not_editable_error_text'));
      }

      setEditSession((current) => current + 1);
      setEditOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount(account.id);
      toast.success(t('account_deleted_success_text'));
      navigate('/accounts');
    } catch (error) {
      handleApiError(error, { showToast: true });
    } finally {
      setDeleteOpen(false);
    }
  };

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
    <>
      <AccountActions
        archiveDisabled={
          account.status === 'archived' || !account.controlAccountId
        }
        isControlAccount={account.isControlAccount}
        loading={isPending}
        onArchive={handleArchive}
        deleteEligibilityChecking={
          eligibility.isPending || eligibility.isFetching
        }
        deleteEligibilityFailed={eligibility.isError}
        deletable={eligibility.isSuccess && eligibility.data.canDelete}
        onActionsOpenChange={setActionsOpen}
        onDelete={handleOpenDelete}
        onEdit={handleEdit}
      />
      <AccountDeleteConfirmation
        accountName={account.name}
        isControlAccount={account.isControlAccount}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={handleDelete}
      />
      <AccountUpdateDialog
        account={account}
        open={editOpen}
        session={editSession}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
