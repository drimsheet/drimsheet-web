import { NavSubmenu } from '@/_app/components/nav-main/parts/nav-submenu';
import { SidebarMenu, SidebarProvider } from '@/shared/components/sidebar';
import { TooltipProvider } from '@/shared/components/tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeftRight } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Shared UI/NavMain/Submenu',
  component: NavSubmenu,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <TooltipProvider>
          <SidebarProvider>
            <SidebarMenu className="w-56">
              <Story />
            </SidebarMenu>
          </SidebarProvider>
        </TooltipProvider>
      </MemoryRouter>
    ),
  ],
  args: {
    item: { title: 'Transactions', icon: <ArrowLeftRight />, isActive: true },
    items: [
      { title: 'Overview', url: '/transactions', isActive: true },
      { title: 'List', url: '/transactions/list' },
    ],
  },
} satisfies Meta<typeof NavSubmenu>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};
export const List: Story = {
  args: {
    items: [
      { title: 'Overview', url: '/transactions' },
      { title: 'List', url: '/transactions/list', isActive: true },
    ],
  },
};
export const Closed: Story = {
  args: { item: { title: 'Transactions', icon: <ArrowLeftRight /> } },
};
