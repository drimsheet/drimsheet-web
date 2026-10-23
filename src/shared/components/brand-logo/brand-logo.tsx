import markDark from '@/shared/assets/logo-dark.svg';
import markLight from '@/shared/assets/logo.svg';
import wordmarkDark from '@/shared/assets/wordmark-dark.svg';
import wordmarkLight from '@/shared/assets/wordmark.svg';
import { cn } from '@/shared/lib/utils/cn';
import type { BrandLogoProps } from './types';

export function BrandLogo({
  alt,
  variant = 'wordmark',
  className,
}: Readonly<BrandLogoProps>) {
  const isMark = variant === 'mark';

  return (
    <span
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn(
        'inline-block shrink-0',
        isMark ? 'size-8' : 'w-32',
        className
      )}
    >
      <img
        src={isMark ? markLight : wordmarkLight}
        alt=""
        width={isMark ? 64 : 325}
        height={isMark ? 64 : 84}
        className="block h-auto w-full dark:hidden"
      />
      <img
        src={isMark ? markDark : wordmarkDark}
        alt=""
        width={isMark ? 64 : 325}
        height={isMark ? 64 : 84}
        className="hidden h-auto w-full dark:block"
      />
    </span>
  );
}
