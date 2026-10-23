import { cn } from '@/shared/lib/utils/cn';
import type { PropsWithChildren } from 'react';

export function AppBody({ children }: Readonly<PropsWithChildren>) {
  return (
    <div className="flex w-full flex-col gap-15 pt-0 max-w-full">
      {children}
    </div>
  );
}

export function AppHeaderTitle({
  className,
  ...props
}: Readonly<React.ComponentProps<'h1'>>) {
  return (
    <h1
      {...props}
      className={cn('text-3xl text-foreground font-medium', className)}
    />
  );
}
