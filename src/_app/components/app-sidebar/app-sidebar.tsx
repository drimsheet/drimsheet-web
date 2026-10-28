import { NavConfigurations } from '@/_app/components/nav-configurations';
import { NavMain, type INavItem } from '@/_app/components/nav-main';
import { APP_VERSION } from '@/_app/lib/configs/app.config';
import { BrandLogo } from '@/shared/components/brand-logo';
import { Button } from '@/shared/components/button';
import { Separator } from '@/shared/components/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from '@/shared/components/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/tooltip';
import {
  ArrowLeftRight,
  BellIcon,
  Building2,
  Calculator,
  HandCoins,
  Info,
  Landmark,
  LayoutDashboard,
  Tags,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppSidebarProps } from './types';

export function AppSidebar({
  currentPath,
  accountControl,
  ...props
}: Readonly<AppSidebarProps>) {
  const { t } = useTranslation(['shared', 'navigation', 'user']);

  const accountingItems: INavItem[] = [
    {
      title: t('shared:dashboard'),
      url: '/dashboard',
      icon: <LayoutDashboard aria-hidden />,
    },
    {
      title: t('shared:accounts'),
      url: '/accounts',
      icon: <Landmark aria-hidden />,
    },
    {
      title: t('shared:transactions'),
      url: '/transactions',
      icon: <ArrowLeftRight aria-hidden />,
    },
    {
      title: t('shared:categories'),
      url: '/categories',
      icon: <Tags aria-hidden />,
    },
    {
      title: t('navigation:debt'),
      url: '/debt',
      icon: <HandCoins aria-hidden />,
    },
    {
      title: t('shared:tax'),
      url: '/tax',
      icon: <Calculator aria-hidden />,
    },
  ];

  const configurationItems: INavItem[] = [
    {
      title: t('shared:counterparties'),
      url: '/counterparties',
      icon: <UsersRound aria-hidden />,
    },
    {
      title: t('navigation:legal_entity'),
      url: '/legal-entity',
      icon: <Building2 aria-hidden />,
    },
    {
      title: t('navigation:profile'),
      url: '/profile',
      icon: <UserRound aria-hidden />,
    },
  ];

  const [accountingNavigation, configurationNavigation] = [
    accountingItems,
    configurationItems,
  ].map((items) =>
    items.map((item) => ({
      ...item,
      isActive:
        !!item.url &&
        (currentPath === item.url || currentPath.startsWith(`${item.url}/`)),
    }))
  );

  const drimsheet_text = t('shared:drimsheet');

  const app_version_label = t('navigation:app_version_label', {
    version: APP_VERSION,
  });

  const toggle_sidebar_label = t('navigation:toggle_sidebar');
  const notifications_label = t('user:notifications_aria_label');

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="app-sidebar-header px-4 py-6 group-data-[collapsible=icon]:px-2">
        <div className="flex min-h-10 items-center gap-2">
          <SidebarTrigger
            aria-label={toggle_sidebar_label}
            className="shrink-0"
          />
          <div
            role="img"
            aria-label={drimsheet_text}
            className="group-data-[collapsible=icon]:hidden"
          >
            <BrandLogo alt="" className="block" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-8 pb-4 group-data-[collapsible=icon]:overflow-y-auto">
        <NavMain items={accountingNavigation} />
        <NavConfigurations items={configurationNavigation} />
      </SidebarContent>
      <SidebarFooter className="gap-2 p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              disabled
              tooltip={notifications_label}
              className="h-10 gap-3 px-3"
            >
              <BellIcon aria-hidden />
              <span>{notifications_label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {accountControl}
        <div className="mt-1 flex flex-col gap-3">
          <Separator />
          <p
            aria-label={app_version_label}
            className="px-3 pb-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden"
          >
            v{APP_VERSION}
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={app_version_label}
                className="hidden self-center group-data-[collapsible=icon]:inline-flex"
              >
                <Info aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{app_version_label}</TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
      <SidebarRail
        aria-label={toggle_sidebar_label}
        title={toggle_sidebar_label}
      />
    </Sidebar>
  );
}
