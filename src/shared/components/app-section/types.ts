import type { ComponentProps, ReactNode } from 'react';

export interface AppSectionProps extends Omit<
  ComponentProps<'section'>,
  'title'
> {
  title?: ReactNode;
  titleId?: string;
}
