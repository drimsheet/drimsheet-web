import type { IMoneyDto } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface IEntryOverviewMenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  variant?: 'default' | 'destructive';
}

export interface EntryOverviewProps {
  title: string;
  subtitle?: string;
  amount: IMoneyDto;
  menuItems: IEntryOverviewMenuItem[];
}
