import type { ComponentProps, ReactNode } from 'react';

export interface PageSectionProps extends Omit<
  ComponentProps<'section'>,
  'title'
> {
  title?: ReactNode;
  titleId?: string;
  titleAdornment?: ReactNode;
  actions?: ReactNode;
}
