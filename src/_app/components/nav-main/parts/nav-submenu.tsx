import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/shared/components/sidebar';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { NavSubmenuProps } from '../types';

export function NavSubmenu({ item, items }: Readonly<NavSubmenuProps>) {
  const { state, isMobile } = useSidebar();

  if (state === 'collapsed' && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={item.isActive}
              aria-label={item.title}
            >
              {item.icon}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuGroup>
              {items.map((child) => (
                <DropdownMenuItem key={child.url} asChild>
                  <Link
                    to={child.url}
                    aria-current={child.isActive ? 'page' : undefined}
                  >
                    {child.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible asChild defaultOpen={item.isActive} className="group/submenu">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={item.isActive}
            className="h-10 gap-3 px-3"
          >
            {item.icon}
            <span>{item.title}</span>
            <ChevronRight
              aria-hidden
              className="ml-auto transition-transform group-data-[state=open]/submenu:rotate-90"
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((child) => (
              <SidebarMenuSubItem key={child.url}>
                <SidebarMenuSubButton asChild isActive={child.isActive}>
                  <Link
                    to={child.url}
                    aria-current={child.isActive ? 'page' : undefined}
                  >
                    {child.title}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
