import { Button } from '@/shared/components/button';
import { cn } from '@/shared/lib/utils/cn';
import { ChevronsUpDownIcon } from 'lucide-react';
import type { SidebarAccountButtonProps } from './types';

export function SidebarAccountButton({
  name,
  avatar,
  description,
  className,
  ...props
}: Readonly<SidebarAccountButtonProps>) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        'h-auto min-h-12 w-full justify-start gap-2 rounded-md p-2 text-left group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:min-h-8 group-data-[collapsible=icon]:p-0',
        className
      )}
      {...props}
    >
      {avatar}
      <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
        <span className="block truncate text-sm font-medium text-foreground">
          {name}
        </span>
        {description && (
          <span className="block truncate text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <ChevronsUpDownIcon
        aria-hidden
        className="group-data-[collapsible=icon]:hidden"
      />
    </Button>
  );
}
