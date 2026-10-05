import { VendorFormSkeleton } from '@/counterparty/components/vendor-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/VendorForm/Skeleton',
  component: VendorFormSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof VendorFormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {};
