import type { IMoneyDto } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';
export type UAccountBehaviorFilter = 'all' | 'bank' | 'petty_cash';
export interface IAccountsTableRow {
  id: string;
  name: string;
  behavior: 'bank' | 'petty_cash' | 'default_cash' | 'other';
  balance: IMoneyDto;
  status: 'draft' | 'active' | 'archived';
}
export interface IAccountsTablePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface IAccountsTableData {
  data: IAccountsTableRow[];
  meta: IAccountsTablePagination;
}
export interface AccountsTableErrorProps {
  title: string;
  description: string;
}
export interface AccountsTableProps {
  accounts?: IAccountsTableData;
  loading: boolean;
  error: boolean;
  search: string;
  type: UAccountBehaviorFilter;
  onSearchChange: (search: string) => void;
  onTypeChange: (type: string) => void;
  onPageChange: (page: number) => void;
  onAddAccount: () => void;
  onViewAccount: (id: string) => void;
  renderRowActions?: (account: IAccountsTableRow) => ReactNode;
}
