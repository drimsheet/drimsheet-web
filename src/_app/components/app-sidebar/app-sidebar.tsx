import { NavConfigurations } from '@/_app/components/nav-configurations';
import { NavMain, type INavItem } from '@/_app/components/nav-main';
import logoImg from '@/shared/assets/logo.svg';
import { Badge } from '@/shared/components/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/shared/components/sidebar';
import {
  ArrowLeftRight,
  Building2,
  Calculator,
  HandCoins,
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
  ...props
}: Readonly<AppSidebarProps>) {
  const { t } = useTranslation(['shared', 'navigation']);

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
    { title: t('navigation:debt'), icon: <HandCoins aria-hidden /> },
    { title: t('shared:tax'), icon: <Calculator aria-hidden /> },
  ];

  const configurationItems: INavItem[] = [
    {
      title: t('shared:counterparties'),
      url: '/counterparties',
      icon: <UsersRound aria-hidden />,
    },
    { title: t('navigation:legal_entities'), icon: <Building2 aria-hidden /> },
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
  const beta_text = t('shared:beta');
  const toggle_sidebar_label = t('navigation:toggle_sidebar');

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="app-sidebar-header px-5 py-6 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-lg"
            alt={drimsheet_text}
          />
          <div className="flex min-w-0 flex-1 items-center gap-2 group-data-[collapsible=icon]:hidden">
            <p className="text-base font-semibold tracking-tight">
              {drimsheet_text}
            </p>
            <Badge variant="outline">{beta_text}</Badge>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-8 pb-4 group-data-[collapsible=icon]:overflow-y-auto">
        <NavMain items={accountingNavigation} />
        <NavConfigurations items={configurationNavigation} />
      </SidebarContent>
      <SidebarRail
        aria-label={toggle_sidebar_label}
        title={toggle_sidebar_label}
      />
    </Sidebar>
  );
}
