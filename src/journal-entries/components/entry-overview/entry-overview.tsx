import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import { Ellipsis } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { EntryOverviewProps } from './types';

export function EntryOverview({
  title,
  subtitle,
  amount,
  menuItems,
}: Readonly<EntryOverviewProps>) {
  const { t } = useTranslation('journal-entries');
  const entry_overview_menu_label = t('entry_overview_menu_label');

  return (
    <article className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium">{title}</h3>
        {subtitle && (
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <span className="font-semibold tabular-nums">{amount}</span>
      {menuItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={entry_overview_menu_label}
            >
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {menuItems.map((item) => (
              <DropdownMenuItem
                key={item.label}
                variant={item.variant}
                onSelect={item.onSelect}
              >
                {item.icon}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </article>
  );
}
