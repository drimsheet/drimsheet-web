import type { ILedgerAccountDto } from '@/shared/lib/api/Api';

export interface AccountUpdateDialogProps {
  account: ILedgerAccountDto;
  open: boolean;
  session: number;
  onClose: () => void;
}
