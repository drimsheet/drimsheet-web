import { EntryOverview } from '@/journal-entries/components/entry-overview';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pencil, Trash2 } from 'lucide-react';

const meta = {
  title: 'Journal Entries/EntryOverview',
  component: EntryOverview,
  tags: ['autodocs'],
} satisfies Meta<typeof EntryOverview>;

export default meta;
type Story = StoryObj<typeof meta>;
export const WithActions: Story = {
  args: {
    title: 'Consulting payment',
    subtitle: 'Acme Ltd.',
    amount: '₦1,000',
    menuItems: [
      { label: 'Edit', icon: <Pencil />, onSelect: () => undefined },
      {
        label: 'Delete',
        icon: <Trash2 />,
        variant: 'destructive',
        onSelect: () => undefined,
      },
    ],
  },
};
