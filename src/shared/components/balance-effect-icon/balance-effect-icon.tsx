import { ItemMedia } from '@/shared/components/item';
import type { ULedgerAccountBalanceEffect } from '@/shared/lib/api/Api';
import { cn } from '@/shared/lib/utils/cn';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { ComponentProps } from 'react';

interface BalanceEffectIconProps extends ComponentProps<'div'> {
  effect: ULedgerAccountBalanceEffect;
}

function BalanceEffectIcon({
  effect,
  className,
  ...props
}: Readonly<BalanceEffectIconProps>) {
  const defaultClassName = 'self-center !translate-y-0 size-16 rounded-full';

  switch (effect) {
    case 'increase':
      return (
        <ItemMedia
          className={cn(defaultClassName, className, 'bg-success-surface')}
          {...props}
        >
          <TrendingUp className="size-7 text-success" />
        </ItemMedia>
      );

    case 'decrease':
      return (
        <ItemMedia
          className={cn(defaultClassName, className, 'bg-error-surface')}
          {...props}
        >
          <TrendingDown className="size-7 text-error" />
        </ItemMedia>
      );

    case 'noop':
      return (
        <ItemMedia
          className={cn(defaultClassName, className, 'bg-muted')}
          {...props}
        >
          <Minus className="size-7 text-muted-foreground opacity-50" />
        </ItemMedia>
      );
  }
}

export { BalanceEffectIcon };
