import { NavConfigurations } from '@/_app/components/nav-configurations';
import { SidebarProvider } from '@/shared/components/sidebar';
import { TooltipProvider } from '@/shared/components/tooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Building2, UserRound, UsersRound } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Shared UI/NavConfigurations',
  component: NavConfigurations,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <TooltipProvider>
          <SidebarProvider>
            <div className="w-64 border p-2">
              <Story />
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof NavConfigurations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        title: 'Counterparties',
        url: '/counterparties',
        icon: <UsersRound />,
        isActive: true,
      },
      { title: 'Legal Entity', url: '/legal-entity', icon: <Building2 /> },
      { title: 'Profile', icon: <UserRound /> },
    ],
  },
};
