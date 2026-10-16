import { CategoryEditorDialog } from '@/account/dialogs/category-editor';
import { useArchiveLedgerAccount } from '@/account/hooks/use-archive-ledger-account';
import { useDeleteLedgerAccount } from '@/account/hooks/use-delete-ledger-account';
import { useLedgerAccountDeletionEligibility } from '@/account/hooks/use-ledger-account-deletion-eligibility';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { CategoryActionsContainerProps } from '../types';
import { CategoryActions } from './category-actions';
import { CategoryDeleteConfirmation } from './category-delete-confirmation';

export function CategoryActionsContainer({
  account,
}: Readonly<CategoryActionsContainerProps>) {
  const { t } = useTranslation('ledger-accounts');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleApiError = useApiErrorHandler();
  const { mutateAsync: archive, isPending } = useArchiveLedgerAccount();
  const { mutateAsync: deleteAccount } = useDeleteLedgerAccount();

  const eligibility = useLedgerAccountDeletionEligibility(
    account.id,
    actionsOpen
  );

  const type = account.type;
  const isCategory = type === 'revenue' || type === 'expense';
  const editDisabled = !isCategory || account.status === 'archived';

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
      await deleteAccount(account.id);
      await queryClient.invalidateQueries({
        queryKey: ['categoryService'],
        refetchType: 'none',
      });
      toast.success(t('category_deleted_success_text'));
      navigate('/categories');
    } catch (error) {
      handleApiError(error, { showToast: true });
    } finally {
      setDeleteOpen(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archive(account.id);
      await queryClient.invalidateQueries({ queryKey: ['categoryService'] });
      toast.success(t('category_archived_success_text'));
    } catch (error) {
      handleApiError(error, { showToast: true });
      throw error;
    }
  };

  return (
    <>
      <CategoryActions
        accountName={account.name}
        onArchive={handleArchive}
        archiveDisabled={!isCategory || account.status === 'archived'}
        loading={isPending}
        onEdit={() => setEditOpen(true)}
        editDisabled={editDisabled}
        deleteEligibilityChecking={
          eligibility.isPending || eligibility.isFetching
        }
        deleteEligibilityFailed={eligibility.isError}
        deletable={eligibility.isSuccess && eligibility.data.canDelete}
        onActionsOpenChange={setActionsOpen}
        onDelete={handleOpenDelete}
      />
      <CategoryDeleteConfirmation
        accountName={account.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={handleDelete}
      />
      {editOpen && isCategory && !editDisabled && (
        <CategoryEditorDialog
          account={{
            accountId: account.id,
            accountName: account.name,
            type,
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}
