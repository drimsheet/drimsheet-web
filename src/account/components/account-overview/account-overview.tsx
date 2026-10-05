import { mapAccountTypeToIcon } from '@/account/lib/mappers/account-to-icon.mapper';
import { Button } from '@/shared/components/button';
import { Money } from '@/shared/components/money';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/tooltip';
import { type ILedgerAccountDto } from '@/shared/lib/api/Api';
import { cn } from '@/shared/lib/utils/cn';
import { Plus, Settings } from 'lucide-react';
import { createElement } from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountOverviewProps extends React.HTMLAttributes<HTMLDivElement> {
  account: ILedgerAccountDto;
  actionButtonText: string;
  hideIcon?: boolean;
  onActionButtonClick?: () => void;
  onSettingsClick?: () => void;
  settingsTooltipLabel?: string;
}

function AccountOverview({
  account,
  actionButtonText,
  hideIcon = false,
  onActionButtonClick,
  onSettingsClick,
  settingsTooltipLabel,
  className,
  ...props
}: Readonly<AccountOverviewProps>) {
  const { t } = useTranslation(['shared']);
  const AccountIcon = mapAccountTypeToIcon(account);

  const accountIcon = createElement(AccountIcon, {
    className: 'size-5',
    'aria-hidden': true,
  });

  const settingsLabel = settingsTooltipLabel ?? t('shared:settings');

  const shouldShowFunctionalBalance =
    account.functionalBalance.currencyCode !== account.balance.currencyCode;

  return (
    <div
      className={cn(
        'grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-3 bg-background p-4 text-foreground sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-rows-2 sm:gap-x-4 sm:gap-y-2 sm:p-6',
        hideIcon &&
          'grid-cols-[minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_auto]',
        className
      )}
      {...props}
    >
      {!hideIcon && (
        <div className="row-span-2 flex size-12 shrink-0 self-center items-center justify-center rounded-lg border border-foreground bg-background text-foreground">
          {accountIcon}
        </div>
      )}

      <div className="min-w-0 self-center truncate font-heading text-xl font-medium leading-none text-muted-foreground">
        {account.name}
      </div>

      <div className="flex items-baseline gap-x-2 self-center">
        <Money
          className="min-w-0 font-heading text-4xl font-bold leading-none tracking-normal text-foreground"
          value={account.balance}
        />

        {shouldShowFunctionalBalance && (
          <span className="flex min-w-0 items-baseline gap-1 font-heading text-sm font-semibold leading-none text-muted-foreground">
            <span aria-hidden="true">≈</span>
            <Money className="truncate" value={account.functionalBalance} />
          </span>
        )}
      </div>

      <div
        className={cn(
          'col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:grid sm:grid-rows-subgrid sm:justify-items-end',
          hideIcon && 'col-span-1 sm:col-start-2'
        )}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={settingsLabel}
                onClick={onSettingsClick}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{settingsLabel}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          type="button"
          onClick={onActionButtonClick}
          className="rounded-xl font-heading font-semibold sm:self-end"
        >
          <Plus />
          {actionButtonText}
        </Button>
      </div>
    </div>
  );
}

export { AccountOverview };
