import { Badge } from '@/shared/components/badge';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/sidebar';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { NavMainProps } from './types';

export function NavMain({ items, label }: Readonly<NavMainProps>) {
  const { t } = useTranslation(['shared', 'navigation']);

  const group_label = label ?? t('shared:accounting');
  const unavailable_text = t('navigation:unavailable');

  return (
    <SidebarGroup className="app-nav px-3 py-0 group-data-[collapsible=icon]:px-2">
      <nav aria-label={group_label}>
        <SidebarGroupLabel className="mb-2" asChild>
          <h2>{group_label}</h2>
        </SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.url ? (
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={item.isActive}
                  className="h-10 gap-3 px-3"
                >
                  <Link
                    to={item.url}
                    aria-current={item.isActive ? 'page' : undefined}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  type="button"
                  disabled
                  aria-label={`${item.title} — ${unavailable_text}`}
                  title={`${item.title} — ${unavailable_text}`}
                  className="h-10 gap-3 px-3"
                >
                  {item.icon}
                  <span className="flex-1">{item.title}</span>
                  <Badge
                    variant="outline"
                    className="group-data-[collapsible=icon]:hidden"
                  >
                    {unavailable_text}
                  </Badge>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </nav>
    </SidebarGroup>
  );
}
