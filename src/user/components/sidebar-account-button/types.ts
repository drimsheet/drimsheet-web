import type { ComponentProps, ReactNode } from 'react';

export interface SidebarAccountButtonProps extends ComponentProps<'button'> {
  name: string;
  avatar: ReactNode;
  description?: string;
}
