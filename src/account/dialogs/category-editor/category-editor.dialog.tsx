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
      if (account?.type === 'revenue')
        return categoryService.updateRevenue(
          account.accountId,
          categoryMapper.toUpdate(values)
        );

      if (account?.type === 'expense')
        return categoryService.updateExpense(
          account.accountId,
          categoryMapper.toUpdate(values)
        );

      if (values.type === 'revenue')
        return categoryService.createRevenue(categoryMapper.toRevenue(values));

      return categoryService.createExpense(categoryMapper.toExpense(values));
    },
  });

  const handleSubmit = async (values: ICategoryFormValues) => {
    try {
      await mutation.mutateAsync(values);
      await queryClient.invalidateQueries({ queryKey: ['categoryService'] });
      onClose();
    } catch {
      // Keep input in place; the form displays a translated retryable error.
    }
  };

  const handleClose = () => {
    if (!mutation.isPending) onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose();
  };

  const type = account?.type === 'expense' ? 'expense' : 'revenue';

  const title = account
    ? t('categories_edit_title')
    : t('categories_add_label');

  const description = account
    ? t('categories_edit_description')
    : t('categories_create_description');

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
          initialValues={{
            name: account?.accountName ?? '',
            type,
            behavior: type === 'revenue' ? 'services' : 'default_direct_cost',
          }}
          editing={!!account}
          pending={mutation.isPending}
          error={mutation.isError}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
