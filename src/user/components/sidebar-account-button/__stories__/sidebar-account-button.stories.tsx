import { AccountingEntityAvatar } from '@/user/components/accounting-entity-avatar';
import { SidebarAccountButton } from '@/user/components/sidebar-account-button';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'User/SidebarAccountButton',
  component: SidebarAccountButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-56 bg-sidebar p-3">
        <Story />
      </div>
    ),
  ],
  args: {
    name: 'Noma Studio',
    avatar: <AccountingEntityAvatar name="Noma Studio" />,
    description: 'hello@noma.example',
    'aria-label': 'Open account management for Noma Studio',
  },
} satisfies Meta<typeof SidebarAccountButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongName: Story = {
  args: { name: 'Noma Studio Design and Consulting Limited' },
};
export const Unavailable: Story = { args: { disabled: true } };
