import { PageTitle } from '@/shared/components/page-title';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/PageTitle',
  component: PageTitle,
  tags: ['autodocs'],
  args: { children: 'Accounts' },
} satisfies Meta<typeof PageTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongTitle: Story = {
  args: { children: 'Business operating account for international payments' },
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
};
