import { Alert, AlertDescription } from '@/shared/components/alert';
import { Skeleton } from '@/shared/components/skeleton';
import { WithTransitionState } from '@/shared/components/with-transition-state';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/WithTransitionState',
  component: WithTransitionState<{ balance: string }>,
  tags: ['autodocs'],
  args: {
    data: { balance: '₦25,000' },
    loading: (
      <div aria-busy="true">
        <output className="sr-only">Loading balance</output>
        <Skeleton className="h-6 w-40" />
      </div>
    ),
    error: (
      <Alert variant="destructive">
        <AlertDescription>Couldn’t load the balance.</AlertDescription>
      </Alert>
    ),
    children: (data) => <p>Balance: {data.balance}</p>,
  },
} satisfies Meta<typeof WithTransitionState<{ balance: string }>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Success: Story = { args: { state: 'success' } };
export const Loading: Story = { args: { state: 'loading', data: undefined } };
export const Error: Story = { args: { state: 'error', data: undefined } };
