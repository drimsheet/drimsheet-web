import { RecordFields } from '@/accounting/pages/legal-entity/parts/record-fields';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Legal Entity/RecordFields',
  component: RecordFields,
  tags: ['autodocs'],
  args: {
    fields: [
      { label: 'Start date', value: '1 Oct 2026' },
      { label: 'End date', value: '31 Oct 2026' },
    ],
  },
} satisfies Meta<typeof RecordFields>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
