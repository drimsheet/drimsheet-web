import type { ReactNode } from 'react';

export interface INavItem {
  title: string;
  url?: string;
  icon: ReactNode;
  isActive?: boolean;
}

export interface NavMainProps {
  items: INavItem[];
  label?: string;
}
