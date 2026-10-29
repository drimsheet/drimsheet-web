import type { IRevenueExpenseAndSuspenseAccountBalanceDto } from '@/shared/lib/api/Api';

export interface CategoryEditorDialogProps {
  account: Pick<
    IRevenueExpenseAndSuspenseAccountBalanceDto,
    'accountId' | 'accountName' | 'type'
  >;
  onClose: () => void;
}
