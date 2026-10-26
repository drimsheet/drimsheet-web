import { Money } from '@/shared/components/money';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/Money',
  component: Money,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-8 bg-background border border-border rounded-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Money>;

export default meta;
type Story = StoryObj<typeof meta>;

export const USD: Story = {
  args: {
    value: { amount: 1545000000, currencyCode: 'USD', isMinorUnit: true },
  },
};

export const EUR: Story = {
  args: {
    value: { amount: 1250000, currencyCode: 'EUR', isMinorUnit: true },
  },
};

export const GBP: Story = {
  args: {
    value: { amount: 432000, currencyCode: 'GBP', isMinorUnit: true },
  },
};

export const Hidden: Story = {
  args: {
    value: { amount: 1545000000, currencyCode: 'USD', isMinorUnit: true },
    hide: true,
  },
};

export const WithZeroMinorUnit: Story = {
  args: {
    value: { amount: 1545000000, currencyCode: 'USD', isMinorUnit: true },
    hideZeroMinorUnit: false,
  },
};

export const Converted: Story = {
  args: {
    value: { amount: 87450000, currencyCode: 'NGN', isMinorUnit: false },
    isConverted: true,
  },
};

export const SmallApproximation: Story = {
  args: {
    value: { amount: 11063, currencyCode: 'USD', isMinorUnit: false },
    isConverted: true,
    className: 'text-3xl',
    approximationClassName: 'text-sm',
  },
};
