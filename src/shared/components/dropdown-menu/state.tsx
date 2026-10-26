import { Skeleton } from '@/shared/components/skeleton';
import { DropdownMenuItem } from './dropdown-menu';
import type { DropdownMenuItemSkeletonProps } from './types';

export function DropdownMenuItemSkeleton(
  props: Readonly<DropdownMenuItemSkeletonProps>
) {
  return (
    <DropdownMenuItem {...props} disabled aria-busy="true">
      <output className="sr-only" aria-label={props['aria-label']}>
        {props['aria-label']}
      </output>
      <div className="flex w-full items-center gap-2">
        <Skeleton className="size-4 shrink-0" />
        <Skeleton className="h-5 flex-1" />
      </div>
    </DropdownMenuItem>
  );
}
