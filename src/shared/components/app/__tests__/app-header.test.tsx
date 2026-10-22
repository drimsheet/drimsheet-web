import { AppHeader, AppHeaderActionsProvider } from '@/shared/components/app';
import { SidebarProvider } from '@/shared/components/sidebar';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

describe('AppHeader', () => {
  it('omits the sidebar trigger when the layout has no collapsible navigation', () => {
    render(<AppHeader showSidebarTrigger={false}>Onboarding</AppHeader>);

    expect(screen.getByRole('banner')).toHaveTextContent('Onboarding');
    expect(
      screen.queryByRole('button', { name: 'Toggle Sidebar' })
    ).not.toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <MemoryRouter>
        <SidebarProvider>
          <AppHeader>
            <div>Test Header Content</div>
          </AppHeader>
        </SidebarProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Header Content')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Toggle Sidebar' })
    ).toBeInTheDocument();
  });

  it('renders breadcrumbs when passed as props', () => {
    const breadcrumbs = [
      { label: 'Accounts', to: '/accounts' },
      { label: 'Petty Cash' },
    ];

    render(
      <MemoryRouter>
        <SidebarProvider>
          <AppHeader breadcrumbs={breadcrumbs} />
        </SidebarProvider>
      </MemoryRouter>
    );

    // Check if both items are rendered
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Petty Cash')).toBeInTheDocument();

    // Accounts is not the last item, so it should be a link
    const accountsLink = screen.getByRole('link', { name: 'Accounts' });
    expect(accountsLink).toBeInTheDocument();
    expect(accountsLink).toHaveAttribute('href', '/accounts');

    // Petty Cash is the last item, so it should NOT be a link (should be rendered as static text)
    const pettyCashText = screen.getByText('Petty Cash');
    expect(pettyCashText.tagName).toBe('SPAN');
  });

  it('renders a static text if crumb has no "to" prop', () => {
    const breadcrumbs = [{ label: 'Accounts' }, { label: 'Petty Cash' }];

    render(
      <MemoryRouter>
        <SidebarProvider>
          <AppHeader breadcrumbs={breadcrumbs} />
        </SidebarProvider>
      </MemoryRouter>
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Accounts').tagName).toBe('SPAN');
    expect(screen.getByText('Petty Cash').tagName).toBe('SPAN');
  });

  it('renders provided actions at the inline end of the header', () => {
    render(
      <MemoryRouter>
        <SidebarProvider>
          <AppHeaderActionsProvider
            actions={<button type="button">Account management</button>}
          >
            <AppHeader>Header content</AppHeader>
          </AppHeaderActionsProvider>
        </SidebarProvider>
      </MemoryRouter>
    );

    const action = screen.getByRole('button', { name: 'Account management' });
    expect(action).toBeInTheDocument();
    expect(action.parentElement).toHaveClass('ml-auto');
  });

  it('does not add an empty action wrapper without a provider value', () => {
    const { container } = render(
      <MemoryRouter>
        <SidebarProvider>
          <AppHeader />
        </SidebarProvider>
      </MemoryRouter>
    );

    expect(container.querySelector('.ml-auto')).not.toBeInTheDocument();
  });
});
