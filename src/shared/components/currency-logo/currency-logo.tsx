import { cn } from '@/shared/lib/utils/cn';
import { CoinsIcon } from 'lucide-react';
import { type ComponentProps } from 'react';

interface CurrencyLogoProps extends ComponentProps<'div'> {
  url?: string;
}

export function CurrencyLogo({
  url,
  className,
  ...props
}: Readonly<CurrencyLogoProps>) {
  if (!url) {
    return <CoinsIcon />;
  }

  return (
    <div
      {...props}
      className={cn(
        'bg-cover bg-center bg-no-repeat rounded-full w-6 h-6',
        className
      )}
      style={{
        backgroundImage: `url(${url})`,
      }}
    />
  );
}
