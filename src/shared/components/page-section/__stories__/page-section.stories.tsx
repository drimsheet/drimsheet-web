import { PageSection } from '@/shared/components/page-section';
import { PageTitle } from '@/shared/components/page-title';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared UI/PageSection',
  component: PageSection,
  tags: ['autodocs'],
  args: {
    title: 'Overview',
    children: <p>Balances and recent account activity.</p>,
  },
} satisfies Meta<typeof PageSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutTitle: Story = { args: { title: undefined } };
export const PageComposition: Story = {
  render: () => (
    <div className="max-w-3xl">
      <PageTitle>Accounts</PageTitle>
      <PageSection title="Overview">
        <p>Balances and recent account activity.</p>
      </PageSection>
      <PageSection title="All accounts">
        <p>Your bank and petty cash accounts.</p>
      </PageSection>
      <PageSection>
        <p>Untitled sections retain the same vertical padding.</p>
      </PageSection>
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
