import { CategoryEditorDialog } from '@/account/dialogs/category-editor';
import { useArchiveLedgerAccount } from '@/account/hooks/use-archive-ledger-account';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { CategoryActionsContainerProps } from '../types';
import { CategoryActions } from './category-actions';

export function CategoryActionsContainer({
  account,
}: Readonly<CategoryActionsContainerProps>) {
  const { t } = useTranslation('ledger-accounts');
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const handleApiError = useApiErrorHandler();
  const { mutateAsync: archive, isPending } = useArchiveLedgerAccount();
  const type = account.type;
  const isCategory = type === 'revenue' || type === 'expense';
  const editDisabled = !isCategory || account.status === 'archived';

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
