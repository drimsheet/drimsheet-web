import {
  CategoryForm,
  type ICategoryFormValues,
} from '@/account/components/category-form';
import { categoryMapper } from '@/account/lib/mappers/category.mapper';
import { categoryService } from '@/account/lib/services/category.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { CategoryEditorDialogProps } from './types';

export function CategoryEditorDialog({
  account,
  onClose,
}: Readonly<CategoryEditorDialogProps>) {
  const { t } = useTranslation('ledger-accounts');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    retry: false,
    mutationFn: async (values: ICategoryFormValues) => {
      if (account.type === 'revenue')
        return categoryService.updateRevenue(
          account.accountId,
          categoryMapper.toUpdate(values)
        );

      return categoryService.updateExpense(
        account.accountId,
        categoryMapper.toUpdate(values)
      );
    },
  });

  const handleSubmit = async (values: ICategoryFormValues) => {
    try {
      await mutation.mutateAsync(values);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categoryService'] }),
        queryClient.invalidateQueries({ queryKey: ['ledgerAccountService'] }),
        queryClient.invalidateQueries({
          queryKey: ['reportingService'],
        }),
      ]);
      onClose();
    } catch {
      // Keep input in place; the form displays a translated error.
    }
  };

  const handleClose = () => {
    if (!mutation.isPending) onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  const title = t('categories_edit_title');
  const description = t('categories_edit_description');

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] overflow-y-auto"
        showCloseButton={!mutation.isPending}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <CategoryForm
          initialValues={{ name: account.accountName }}
          pending={mutation.isPending}
          error={mutation.isError}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
