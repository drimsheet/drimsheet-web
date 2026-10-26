import { Skeleton } from '@/shared/components/skeleton';
import { cn } from '@/shared/lib/utils/cn';
import type { SidebarMenuButtonSkeletonProps } from './types';

export function SidebarMenuButtonSkeleton({
  className,
  showIcon = false,
  ...props
}: Readonly<SidebarMenuButtonSkeletonProps>) {
  return (
    <div
      {...props}
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      aria-busy="true"
      className={cn(
        'flex h-8 items-center gap-2 rounded-md px-2 group-data-[collapsible=icon]:size-8',
        className
      )}
    >
      {showIcon && (
        <Skeleton
          className="size-4 shrink-0 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-3/4 flex-1 group-data-[collapsible=icon]:hidden"
        data-sidebar="menu-skeleton-text"
      />
    </div>
  );
}
