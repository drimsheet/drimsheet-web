import type { ReactNode } from 'react';

export interface INavItem {
  title: string;
  url?: string;
  icon: ReactNode;
  isActive?: boolean;
  items?: INavSubItem[];
}

export interface NavMainProps {
  items: INavItem[];
  label?: string;
}

export interface INavSubItem {
  title: string;
  url: string;
  isActive?: boolean;
}

export interface NavSubmenuProps {
  item: INavItem;
  items: INavSubItem[];
}
