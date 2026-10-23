import { AccountingEntityOnboardingSidebar } from '@/onboarding/pages/accounting-entity-onboarding/parts/sidebar';
import { SidebarProvider } from '@/shared/components/sidebar';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Onboarding/Accounting Entity/Sidebar',
  component: AccountingEntityOnboardingSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof AccountingEntityOnboardingSidebar>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};

export const WithCompletedSteps: TStory = {
  args: { currentStep: 3 },
};

export const FinalStep: TStory = {
  args: { currentStep: 5 },
};
