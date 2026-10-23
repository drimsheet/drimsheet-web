import { BrandLogo } from '@/shared/components/brand-logo';
import type { FullPageLoaderProps } from './types';

export function FullPageLoader({ label }: Readonly<FullPageLoaderProps>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-md"
    >
      <BrandLogo
        variant="mark"
        className="size-25 animate-pulse-scale motion-reduce:animate-none"
        alt=""
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
