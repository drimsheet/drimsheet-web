import type { Avatar } from '@/shared/components/avatar';
import type { ComponentProps } from 'react';

export interface AccountingEntityAvatarProps extends Omit<
  ComponentProps<typeof Avatar>,
  'children'
> {
  fallbackClassName?: string;
  name: string;
}

export interface AccountingEntityAvatarContainerProps {
  onLogoutClick: () => void;
}
