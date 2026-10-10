import type { ReactNode } from 'react';

export interface RecentTransactionsProps {
  counterpartyName: string;
  empty: boolean;
  children?: ReactNode;
}
