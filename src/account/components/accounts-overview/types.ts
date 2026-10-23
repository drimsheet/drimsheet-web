import type { IMoneyDto, ULedgerType } from '@/shared/lib/api/Api';

export interface LedgerAccountsOverviewProps {
  type: ULedgerType;
  title: string;
  balance: IMoneyDto;
  description: string;
  className?: string;
}
