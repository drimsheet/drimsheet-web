import { AppSidebar } from '@/_app/components/app-sidebar';
import { AppBody } from '@/shared/components/app';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { PageSection } from '@/shared/components/page-section';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/shared/components/sidebar';
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
                <SidebarInset>
                  <div className="mb-8 flex min-w-0 flex-1 flex-col gap-4 p-4 md:px-8 md:py-6">
                    <SidebarTrigger className="md:hidden" />
                    <AppBody
                      titleSlot={
                        <>
                          Accounts <Badge variant="secondary">Archived</Badge>
                        </>
                      }
                      actionsSlot={<Button>Create account</Button>}
                    >
                      <PageSection title="Overview">
                        Account balances and recent activity.
                      </PageSection>
                    </AppBody>
                  </div>
                </SidebarInset>
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

export const DarkCollapsed: Story = {
  args: { currentPath: '/transactions' },
  parameters: { dark: true, collapsed: true },
};
