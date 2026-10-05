import { NavConfigurations } from '@/_app/components/nav-configurations';
import { SidebarProvider } from '@/shared/components/sidebar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Settings } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Shared UI/NavConfigurations',
  component: NavConfigurations,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <SidebarProvider>
          <div className="w-64 border p-2">
            <Story />
          </div>
        </SidebarProvider>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof NavConfigurations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { name: 'Settings', url: '#', icon: <Settings className="size-4" /> },
    ],
  },
};
