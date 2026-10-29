import { AppSidebar } from '@/_app/components/app-sidebar';
import { APP_VERSION } from '@/_app/lib/configs/app.config';
import { SidebarProvider } from '@/shared/components/sidebar';
import { TooltipProvider } from '@/shared/components/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('AppSidebar', () => {
  it('highlights Accounts instead of Dashboard on an account route', () => {
    render(
      <MemoryRouter initialEntries={['/accounts']}>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <TooltipProvider>
              <AppSidebar currentPath="/accounts" />
            </TooltipProvider>
          </SidebarProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('img', { name: 'Drimsheet' })).toBeInTheDocument();
    expect(screen.getByText(`v${APP_VERSION}`)).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'data-active',
      'false'
    );
    expect(screen.getByRole('link', { name: 'Accounts' })).toHaveAttribute(
      'data-active',
      'true'
    );
    expect(screen.queryByText('Bank accounts')).not.toBeInTheDocument();
    expect(screen.queryByText('Petty cash accounts')).not.toBeInTheDocument();
  });

  it('expands Transactions with the active List destination and can collapse it', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/transactions/list']}>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <TooltipProvider>
              <AppSidebar currentPath="/transactions/list" />
            </TooltipProvider>
          </SidebarProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('button', { name: 'Transactions' })
    ).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'href',
      '/transactions'
    );
    expect(screen.getByRole('link', { name: 'List' })).toHaveAttribute(
      'href',
      '/transactions/list'
    );
    expect(screen.getByRole('link', { name: 'List' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
      'aria-current'
    );
    await user.click(screen.getByRole('button', { name: 'Transactions' }));
    expect(
      screen.getByRole('button', { name: 'Transactions' })
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: 'List' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Income' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Expenses' })
    ).not.toBeInTheDocument();
  });
  it('groups financial work separately from configuration', () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar currentPath="/categories" />
          </SidebarProvider>
        </TooltipProvider>
      </MemoryRouter>
    );

    const accounting = within(
      screen.getByRole('navigation', { name: 'Accounting' })
    );

    const configuration = within(
      screen.getByRole('navigation', { name: 'Configuration' })
    );

    expect(
      accounting.getAllByRole('link').map((link) => link.textContent)
    ).toEqual(['Dashboard', 'Accounts', 'Categories', 'Debt', 'Tax']);
    expect(
      accounting.getByRole('link', { name: 'Categories' })
    ).toHaveAttribute('aria-current', 'page');
    expect(
      configuration.getByRole('link', { name: 'Counterparties' })
    ).toHaveAttribute('href', '/counterparties');
    expect(
      configuration.queryByRole('link', { name: 'Categories' })
    ).not.toBeInTheDocument();
  });

  it('links Debt and Tax to their destinations and highlights the current page', () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar currentPath="/debt" />
          </SidebarProvider>
        </TooltipProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Debt' })).toHaveAttribute(
      'href',
      '/debt'
    );
    expect(screen.getByRole('link', { name: 'Debt' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: 'Tax' })).toHaveAttribute(
      'href',
      '/tax'
    );
  });

  it('opens transaction destinations from the collapsed sidebar with the keyboard', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TooltipProvider>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar currentPath="/transactions" />
          </SidebarProvider>
        </TooltipProvider>
      </MemoryRouter>
    );
    screen.getByRole('button', { name: 'Transactions' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('menuitem', { name: 'Overview' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('menuitem', { name: 'List' })).toHaveAttribute(
      'href',
      '/transactions/list'
    );
  });

  it('keeps configuration navigation available when collapsed', () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar currentPath="/counterparties/company-1" />
          </SidebarProvider>
        </TooltipProvider>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('link', { name: 'Counterparties' })
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('navigation', { name: 'Configuration' })
    ).toBeVisible();
  });
});
