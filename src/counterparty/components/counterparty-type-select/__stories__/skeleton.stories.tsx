import { CounterpartyTypeSelectSkeleton } from '@/counterparty/components/counterparty-type-select';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/CounterpartyTypeSelect/Skeleton',
  component: CounterpartyTypeSelectSkeleton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[min(42rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CounterpartyTypeSelectSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {};
