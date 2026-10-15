import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/collapsible';
import { Label } from '@/shared/components/label';
import { RadioGroupItem } from '@/shared/components/radio-group';
import { ChevronRight } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccountTreeNodeProps } from '../types';

export function AccountTreeNode({ account }: Readonly<AccountTreeNodeProps>) {
  const { t } = useTranslation('ledger-accounts');
  const id = useId();
  const hasChildren = account.children.length > 0;

  const account_kind = account.isControlAccount
    ? t('category_creation_control_label')
    : t('category_creation_posting_label');

  const toggle_label = t('category_creation_toggle_account', {
    name: account.name,
  });

  const status_label = t(`categories_status_${account.status}`);

  return (
    <li className="min-w-0">
      <Collapsible defaultOpen>
        <div className="flex min-w-0 items-center gap-2 rounded-md px-2 has-[[data-state=checked]]:bg-accent">
          {hasChildren && (
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={toggle_label}
                className="shrink-0 [&[data-state=open]>svg]:rotate-90"
              >
                <ChevronRight />
              </Button>
            </CollapsibleTrigger>
          )}
          {!hasChildren && <span className="w-8 shrink-0" aria-hidden />}
          <RadioGroupItem
            id={id}
            value={account.id}
            aria-label={account.name}
          />
          <Label
            htmlFor={id}
            className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3"
          >
            <span className="min-w-0 break-words">{account.name}</span>
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-normal text-muted-foreground">
                {account_kind}
              </span>
              {account.status !== 'active' && (
                <Badge variant="outline">{status_label}</Badge>
              )}
            </span>
          </Label>
        </div>
        {hasChildren && (
          <CollapsibleContent>
            <ul className="ml-4 border-l border-border pl-2 sm:ml-5 sm:pl-3">
              {account.children.map((child) => (
                <AccountTreeNode key={child.id} account={child} />
              ))}
            </ul>
          </CollapsibleContent>
        )}
      </Collapsible>
    </li>
  );
}
