import type { IRevenueExpenseAccountDto } from '@/shared/lib/api/Api';

export interface CategoryEditorDialogProps {
  account?: IRevenueExpenseAccountDto;
  onClose: () => void;
}
