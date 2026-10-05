import { EmployerFormSkeleton } from '@/counterparty/components/employer-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/EmployerForm/Skeleton',
  component: EmployerFormSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof EmployerFormSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {};
