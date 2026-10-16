import type { IRevenueExpenseAccountDto } from '@/shared/lib/api/Api';

export interface CategoryEditorDialogProps {
  account: Pick<
    IRevenueExpenseAccountDto,
    'accountId' | 'accountName' | 'type'
  >;
  onClose: () => void;
}
