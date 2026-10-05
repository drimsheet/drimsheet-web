import { ELedgerType, type ULedgerType } from '@/shared/lib/api/Api';
import { cn } from '@/shared/lib/utils/cn';
import { CreditCard, Receipt, Scale, TrendingUp, Wallet } from 'lucide-react';

export interface LedgerTypeIconProps {
  type: ULedgerType;
  className?: string;
}

const typeConfigs = {
  [ELedgerType.Revenue]: {
    icon: TrendingUp,
    style: 'bg-success/10 text-success border-success/20',
  },
  [ELedgerType.Expense]: {
    icon: Receipt,
    style: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  [ELedgerType.Asset]: {
    icon: Wallet,
    style: 'bg-info/10 text-info border-info/20',
  },
  [ELedgerType.Liability]: {
    icon: CreditCard,
    style: 'bg-warning/10 text-warning border-warning/20',
  },
  [ELedgerType.Equity]: {
    icon: Scale,
    style: 'bg-primary/10 text-primary border-primary/20',
  },
};

export function LedgerTypeIcon({
  type,
  className,
}: Readonly<LedgerTypeIconProps>) {
  const config = typeConfigs[type];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center justify-center p-2 rounded-xl border shrink-0',
        config.style,
        className
      )}
    >
      <Icon className="size-5" />
    </div>
  );
}
