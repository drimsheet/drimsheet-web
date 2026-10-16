import type { IAccountingEntity } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface AccountManagementProps {
  accountingEntities: IAccountingEntity[];
  activeEntity: IAccountingEntity;
  email?: string;
  onProfileClick?: () => void;
  onAddAccount: () => void;
  onLogoutClick: () => void;
  onSelectEntity: (entityId: string) => void;
  themeAction: ReactNode;
  titleId: string;
}
