import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/shared/components/breadcrumb';
import { Skeleton } from '@/shared/components/skeleton';
import { Fragment } from 'react';
import type { PageBreadcrumbsSkeletonProps } from './types';

export function PageBreadcrumbsSkeleton({
  itemsCount = 2,
}: Readonly<PageBreadcrumbsSkeletonProps>) {
  return (
    <Breadcrumb aria-busy="true">
      <BreadcrumbList>
        {Array.from({ length: itemsCount }, (_, index) => (
          <Fragment key={index}>
            <BreadcrumbItem>
              <Skeleton className="h-5 w-25" />
            </BreadcrumbItem>
            {index < itemsCount - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
