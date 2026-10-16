import type { IAccountingEntity } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface AccountManagementDialogProps {
  activeEntity: IAccountingEntity;
  children: ReactNode;
  onLogoutClick: () => void;
}
