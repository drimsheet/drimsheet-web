import { CategoryDeleteConfirmation } from '@/account/components/category-delete-confirmation';
import { useDeleteLedgerAccount } from '@/account/hooks/use-delete-ledger-account';
import { useLedgerAccountDeletionEligibility } from '@/account/hooks/use-ledger-account-deletion-eligibility';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { CategoryRowActionsProps } from '../types';
import { CategoryRowActions } from './category-row-actions';

type CategoryRowActionsContainerProps = Pick<
  CategoryRowActionsProps,
  'account' | 'onViewAccount' | 'onEditAccount' | 'onArchiveAccount'
>;

export function CategoryRowActionsContainer({
  account,
  onViewAccount,
  onEditAccount,
  onArchiveAccount,
}: Readonly<CategoryRowActionsContainerProps>) {
  const { t } = useTranslation('ledger-accounts');
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleApiError = useApiErrorHandler();
  const deletion = useDeleteLedgerAccount();

  const eligibility = useLedgerAccountDeletionEligibility(
    account.accountId,
    menuOpen
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

  const handleDelete = async () => {
    try {
      await deletion.mutateAsync(account.accountId);
      await queryClient.invalidateQueries({ queryKey: ['categoryService'] });
      await queryClient.refetchQueries({
        queryKey: ['ledgerAccountService'],
        type: 'active',
      });
      await queryClient.refetchQueries({
        queryKey: ['ledgerReportingService'],
        type: 'active',
      });
      toast.success(t('category_deleted_success_text'));
    } catch (error) {
      handleApiError(error, { showToast: true });
    } finally {
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <CategoryRowActions
        account={account}
        onViewAccount={onViewAccount}
        onEditAccount={onEditAccount}
        onArchiveAccount={onArchiveAccount}
        checking={menuOpen && (eligibility.isPending || eligibility.isFetching)}
        eligibilityFailed={menuOpen && eligibility.isError}
        canDelete={
          menuOpen && eligibility.isSuccess && eligibility.data.canDelete
        }
        deleting={deletion.isPending}
        onOpenChange={setMenuOpen}
        onDelete={handleOpenDelete}
      />
      <CategoryDeleteConfirmation
        accountName={account.accountName}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={handleDelete}
      />
    </>
  );
}
