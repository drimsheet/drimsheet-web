import { CounterpartyDeleteAction } from '@/counterparty/components/counterparties-table/parts/counterparty-delete-action';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/CounterpartiesTable/Parts/CounterpartyDeleteAction',
  component: CounterpartyDeleteAction,
  tags: ['autodocs'],
  args: { onSelect: () => undefined },
  render: (args) => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <CounterpartyDeleteAction {...args} />
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<typeof CounterpartyDeleteAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
