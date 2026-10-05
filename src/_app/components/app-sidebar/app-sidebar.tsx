import { NavConfigurations } from '@/_app/components/nav-configurations';
import { NavMain } from '@/_app/components/nav-main';
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
  Calculator,
  CircleMinus,
  Landmark,
  LayoutDashboard,
  Tags,
  UsersRound,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppSidebarProps } from './types';

function isRouteActive(currentPath: string, itemUrl: string) {
  return (
    itemUrl !== '#' &&
    (currentPath === itemUrl || currentPath.startsWith(`${itemUrl}/`))
  );
}

export function AppSidebar({
  currentPath,
  ...props
}: Readonly<AppSidebarProps>) {
  const { t } = useTranslation(['shared']);

  const sidebarData = useMemo(
    () => ({
      navMain: [
        {
          title: t('shared:dashboard'),
          url: '/dashboard',
          icon: <LayoutDashboard />,
          isActive: isRouteActive(currentPath, '/dashboard'),
        },
        {
          title: t('shared:accounts'),
          url: '/accounts',
          icon: <Landmark />,
          isActive: isRouteActive(currentPath, '/accounts'),
        },
        {
          title: t('shared:transactions'),
          url: '/transactions',
          icon: <ArrowLeftRight />,
          isActive: isRouteActive(currentPath, '/transactions'),
        },
        {
          title: t('shared:liabilities'),
          url: '#',
          icon: <CircleMinus />,
        },
      ],
      configurations: [
        {
          name: t('shared:counterparties'),
          url: '/counterparties',
          isActive: isRouteActive(currentPath, '/counterparties'),
          icon: <UsersRound />,
        },
        {
          name: t('shared:categories'),
          url: '#',
          icon: <Tags />,
        },
        {
          name: t('shared:tax'),
          url: '#',
          icon: <Calculator />,
        },
      ],
    }),
    [currentPath, t]
  );

  const drimsheetText = t('shared:drimsheet');
  const betaText = t('shared:beta');

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <img
            src={logoImg}
            width={40}
            height={40}
            className="rounded-lg"
            alt={drimsheetText}
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold">{drimsheetText}</p>
            <Badge variant="outline" className="w-fit">
              {betaText}
            </Badge>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        <NavConfigurations items={sidebarData.configurations} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
