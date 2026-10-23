import { AppSidebar } from '@/_app/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/shared/components/sidebar';
import { TooltipProvider } from '@/shared/components/tooltip';
import { AccountingEntityAvatar } from '@/user/components/accounting-entity-avatar';
import { SidebarAccountButton } from '@/user/components/sidebar-account-button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Shared UI/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  args: {
    accountControl: (
      <SidebarAccountButton
        name="Noma Studio"
        avatar={<AccountingEntityAvatar name="Noma Studio" />}
        description="hello@noma.example"
      />
    ),
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story, context) => (
      <MemoryRouter>
        <div className={context.parameters.dark ? 'dark' : undefined}>
          <TooltipProvider>
            <SidebarProvider
              defaultOpen={!context.parameters.collapsed}
              style={{ '--sidebar-width': '14rem' } as React.CSSProperties}
            >
              <div className="flex h-screen w-full bg-background text-foreground">
                <Story />
                <main className="flex-1 p-6">
                  <SidebarTrigger className="md:hidden" />
                </main>
              </div>
            </SidebarProvider>
          </TooltipProvider>
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPath: '/dashboard',
  },
};

export const Categories: Story = { args: { currentPath: '/categories' } };
export const Counterparties: Story = {
  args: { currentPath: '/counterparties/company-1' },
};
export const Collapsed: Story = {
  args: { currentPath: '/transactions' },
  parameters: { collapsed: true },
};
export const Dark: Story = {
  args: { currentPath: '/accounts' },
  parameters: { dark: true },
};
