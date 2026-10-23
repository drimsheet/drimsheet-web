import type { Sidebar } from '@/shared/components/sidebar';
import type { ComponentProps, ReactNode } from 'react';

export interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  currentPath: string;
  accountControl?: ReactNode;
}
