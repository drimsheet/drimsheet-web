import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/shared/components/chart';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bar, BarChart, XAxis } from 'recharts';

const meta = {
  title: 'Shared/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
  args: {
    config: { moneyIn: { label: 'Money in', color: 'var(--chart-1)' } },
    children: (
      <BarChart
        data={[
          { month: 'Jan', moneyIn: 100 },
          { month: 'Feb', moneyIn: 150 },
        ]}
      >
        <XAxis dataKey="month" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="moneyIn" fill="var(--color-moneyIn)" />
      </BarChart>
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
