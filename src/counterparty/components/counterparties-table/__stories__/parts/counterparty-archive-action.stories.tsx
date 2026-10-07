import { CounterpartyArchiveAction } from '@/counterparty/components/counterparties-table/parts/counterparty-archive-action';
import { Button } from '@/shared/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/dropdown-menu';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Counterparty/CounterpartiesTable/Parts/CounterpartyArchiveAction',
  component: CounterpartyArchiveAction,
  tags: ['autodocs'],
  args: { onSelect: () => undefined },
  render: (args) => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Actions</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <CounterpartyArchiveAction {...args} />
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<typeof CounterpartyArchiveAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };
