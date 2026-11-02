import type { IPageBreadcrumb } from '@/shared/components/page-breadcrumbs';
import type { PropsWithChildren, ReactNode } from 'react';

export type AppBodyProps = PropsWithChildren<{
  title?: string;
  /** Inline heading content; takes precedence over title when non-nullish. */
  titleSlot?: ReactNode;
  titleBadgeSlot?: ReactNode;
  breadcrumbs?: IPageBreadcrumb;
  actionsSlot?: ReactNode;
  /** Supporting content displayed immediately above the title row. */
  metadataSlot?: ReactNode;
}>;
