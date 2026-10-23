import { AppSidebar } from '@/_app/components/app-sidebar';
import { AppBody } from '@/shared/components/app';
import { PageSection } from '@/shared/components/page-section';
import { PageTitle } from '@/shared/components/page-title';
import { SidebarProvider } from '@/shared/components/sidebar';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Shared UI/App',
  component: AppBody,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background font-sans text-foreground">
            <AppSidebar currentPath="/dashboard" />
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1 p-6">
                <Story />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof AppBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AppBody>
      <div className="flex flex-col">
        <PageTitle>Application Shell</PageTitle>
        <PageSection>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to the main application interface! This story showcases the
            full app layout, including the Sidebar and Page Body.
          </p>
        </PageSection>
      </div>
    </AppBody>
  ),
};
