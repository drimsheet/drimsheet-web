import { AppBody } from '@/shared/components/app';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { PageSection } from '@/shared/components/page-section';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Shared UI/App',
  component: AppBody,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <main className="bg-background p-4 text-foreground md:px-8 md:py-6">
          <Story />
        </main>
      </MemoryRouter>
    ),
  ],
  args: {
    title: 'Accounts',
    children: <PageSection>Account balances and recent activity.</PageSection>,
  },
} satisfies Meta<typeof AppBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSlots: Story = {
  args: {
    titleSlot: (
      <>
        Accounts <Badge>Archived</Badge>
      </>
    ),
    breadcrumbs: {
      label: 'Dashboard',
      link: '/dashboard',
      next: { label: 'Accounts' },
    },
    actionsSlot: <Button>Create account</Button>,
  },
};

export const LongTitle: Story = {
  args: {
    title:
      'Operating accounts for international subsidiaries and regional offices',
    actionsSlot: <Button>Create account</Button>,
  },
};

export const BreadcrumbsOnly: Story = {
  args: {
    title: undefined,
    breadcrumbs: {
      label: 'Accounts',
      link: '/accounts',
      next: { label: 'Operating account' },
    },
  },
};

export const ActionsOnly: Story = {
  args: { title: undefined, actionsSlot: <Button>Create account</Button> },
};

export const ContentOnly: Story = { args: { title: undefined } };
