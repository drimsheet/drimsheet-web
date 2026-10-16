import { SectionState } from '@/accounting/pages/legal-entity/parts/section-state';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

const meta = {
  title: 'Accounting/Legal Entity/SectionState',
  component: SectionState,
  tags: ['autodocs'],
  args: { label: 'Accounting Context', state: 'loading', onRetry: fn() },
} satisfies Meta<typeof SectionState>;

export default meta;
type TStory = StoryObj<typeof meta>;
export const Loading: TStory = {};
export const Error: TStory = { args: { state: 'error' } };
export const Empty: TStory = { args: { state: 'empty' } };
