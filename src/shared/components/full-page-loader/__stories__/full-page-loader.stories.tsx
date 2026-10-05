import { FullPageLoader } from '@/shared/components/full-page-loader';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/FullPageLoader',
  component: FullPageLoader,
  tags: ['autodocs'],
  args: {
    label: 'Loading Drimsheet',
  },
} satisfies Meta<typeof FullPageLoader>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
