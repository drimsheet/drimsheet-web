import { SectionError } from '@/accounting/pages/legal-entity-details/parts/section-error';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Accounting/Legal Entity Details/SectionError',
  component: SectionError,
  tags: ['autodocs'],
  args: { onRetry: () => {}, pending: false },
} satisfies Meta<typeof SectionError>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Default: TStory = {};
export const Retrying: TStory = { args: { pending: true } };
