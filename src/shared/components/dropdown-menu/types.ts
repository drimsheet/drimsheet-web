import type { ComponentProps } from 'react';
import type { DropdownMenuItem } from './dropdown-menu';

export type DropdownMenuItemSkeletonProps = Pick<
  ComponentProps<typeof DropdownMenuItem>,
  'aria-label' | 'className' | 'inset'
>;
