import { AccountDeleteConfirmation } from '@/account/components/account-delete-confirmation';
import { AccountUpdateDialog } from '@/account/dialogs/account-update';
import { useArchiveLedgerAccount } from '@/account/hooks/use-archive-ledger-account';
import { useDeleteLedgerAccount } from '@/account/hooks/use-delete-ledger-account';
import { useLedgerAccountDeletionEligibility } from '@/account/hooks/use-ledger-account-deletion-eligibility';
import { ledgerAccountService } from '@/account/lib/services/ledger-account.service';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import type { ILedgerAccountDto } from '@/shared/lib/api/Api';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { TAccountTableRow } from '../types';
import { AccountRowActions } from './account-row-actions';

interface AccountRowActionsContainerProps {
  account: TAccountTableRow;
}

export function AccountRowActionsContainer({
  account,
}: Readonly<AccountRowActionsContainerProps>) {
  const { t } = useTranslation('ledger-accounts');
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editAccount, setEditAccount] = useState<ILedgerAccountDto | null>(
    null
  );

  const [loadingEdit, setLoadingEdit] = useState(false);
  const handleApiError = useApiErrorHandler();
  const archive = useArchiveLedgerAccount();
  const deletion = useDeleteLedgerAccount();
  const eligibility = useLedgerAccountDeletionEligibility(account.id, menuOpen);

  const handleEdit = async () => {
    setLoadingEdit(true);
    try {
      const details = await ledgerAccountService.getLedgerAccount(account.id);
      if (details.status === 'archived') {
        toast.error(t('archived_account_not_editable_error_text'));

        return;
      }

      setEditAccount(details);
    } catch (error) {
      handleApiError(error, { showToast: true });
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archive.mutateAsync(account.id);
      toast.success(t('account_archived_success_text'));
    } catch (error) {
      handleApiError(error, { showToast: true });
    }
  };

  const handleOpenDelete = () => {
    if (
      eligibility.isSuccess &&
      !eligibility.isFetching &&
      eligibility.data.canDelete
    ) {
      setDeleteOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deletion.mutateAsync(account.id);
      toast.success(t('account_deleted_success_text'));
      await queryClient.refetchQueries({
        queryKey: ['ledgerAccountService'],
        type: 'active',
      });
    } catch (error) {
      handleApiError(error, { showToast: true });
    } finally {
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <AccountRowActions
        account={account}
        busy={loadingEdit || archive.isPending || deletion.isPending}
        checking={eligibility.isPending || eligibility.isFetching}
        eligibilityFailed={eligibility.isError}
        canDelete={eligibility.isSuccess && eligibility.data.canDelete}
        onOpenChange={setMenuOpen}
        onEdit={handleEdit}
        onArchive={handleArchive}
        onDelete={handleOpenDelete}
      />
      <AccountDeleteConfirmation
        accountName={account.name}
        isControlAccount={false}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={handleDelete}
      />
      {editAccount && (
        <AccountUpdateDialog
          account={editAccount}
          open
          session={0}
          onClose={() => setEditAccount(null)}
        />
      )}
    </>
  );
}
