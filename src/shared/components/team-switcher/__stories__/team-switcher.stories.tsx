import { SidebarProvider } from '@/shared/components/sidebar';
import { TeamSwitcher } from '@/shared/components/team-switcher';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Home } from 'lucide-react';

const meta = {
  title: 'Shared UI/TeamSwitcher',
  component: TeamSwitcher,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="w-64 border p-2">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof TeamSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teams: [
      {
        name: 'Acme Corp',
        logo: <Home className="size-4" />,
        plan: 'Enterprise',
      },
    ],
  },
};
