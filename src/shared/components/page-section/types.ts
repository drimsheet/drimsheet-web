import type { ComponentProps, ReactNode } from 'react';

export type PageSectionTitleProps = ComponentProps<'h2'>;

export interface PageSectionProps extends Omit<
  ComponentProps<'section'>,
  'title'
> {
  title?: ReactNode;
  titleId?: string;
}
