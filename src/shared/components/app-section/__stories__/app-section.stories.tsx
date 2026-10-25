import { AppSection } from '@/shared/components/app-section';
import { PageTitle } from '@/shared/components/page-title';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/AppSection',
  component: AppSection,
  tags: ['autodocs'],
  args: {
    title: 'Overview',
    children: <p>Balances and recent account activity.</p>,
  },
} satisfies Meta<typeof AppSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutTitle: Story = { args: { title: undefined } };
export const PageComposition: Story = {
  render: () => (
    <div className="max-w-3xl">
      <PageTitle>Accounts</PageTitle>
      <AppSection title="Overview">
        <p>Balances and recent account activity.</p>
      </AppSection>
      <AppSection title="All accounts">
        <p>Your bank and petty cash accounts.</p>
      </AppSection>
      <AppSection>
        <p>Untitled sections retain the same vertical padding.</p>
      </AppSection>
    </div>
  ),
};

export const NarrowPageComposition: Story = {
  ...PageComposition,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
