import fixtures from '@/accounting/pages/legal-entity-details/__stories__/fixtures.json';
import { ContextDetails } from '@/accounting/pages/legal-entity-details/parts/context-details';
import type { TFiscalYearContext } from '@/accounting/pages/legal-entity-details/types';
import type { Meta, StoryObj } from '@storybook/react-vite';
const context = fixtures.context as TFiscalYearContext;
const now = fixtures.now;

const meta = {
  title: 'Accounting/Legal Entity Details/ContextDetails',
  component: ContextDetails,
  tags: ['autodocs'],
  args: { context, now },
} satisfies Meta<typeof ContextDetails>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Empty: TStory = {
  args: {
    context: {
      accounting: null,
      reporting: null,
      accountingInterval: null,
      reportingInterval: null,
    },
  },
};
