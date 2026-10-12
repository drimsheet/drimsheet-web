import { ChartContainer, ChartTooltipContent } from '@/shared/components/chart';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/ChartTooltipContent',
  component: ChartTooltipContent,
  tags: ['autodocs'],
  args: {
    active: true,
    label: 'October',
    payload: [
      {
        graphicalItemId: 'moneyIn',
        name: 'moneyIn',
        dataKey: 'moneyIn',
        value: 1200,
        color: 'var(--chart-1)',
      },
    ],
  },
  decorators: [
    (Story) => (
      <ChartContainer
        config={{ moneyIn: { label: 'Money in', color: 'var(--chart-1)' } }}
      >
        <Story />
      </ChartContainer>
    ),
  ],
} satisfies Meta<typeof ChartTooltipContent>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
