import { cn } from '@/shared/lib/utils/cn';
import type { PageTitleProps } from './types';

export function PageTitle({
  className,
  children,
  ...props
}: Readonly<PageTitleProps>) {
  return (
    <h1
      {...props}
      className={cn(
        'm-0 text-[28px] leading-tight font-medium tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </h1>
  );
}
