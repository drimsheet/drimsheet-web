import { AppSidebar } from '@/_app/components/app-sidebar';
import { SidebarProvider } from '@/shared/components/sidebar';
import { TooltipProvider } from '@/shared/components/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
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

    expect(screen.getByText('Drimsheet')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();

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

  it('highlights Transactions and removes Income and Expenses', () => {
    render(
      <MemoryRouter initialEntries={['/transactions/transfer']}>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <TooltipProvider>
              <AppSidebar currentPath="/transactions/transfer" />
            </TooltipProvider>
          </SidebarProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Transactions' })).toHaveAttribute(
      'data-active',
      'true'
    );
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
    ).toEqual(['Dashboard', 'Accounts', 'Transactions', 'Categories']);
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

  it('marks unfinished destinations as unavailable instead of linking to nowhere', () => {
    render(
      <MemoryRouter>
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar currentPath="/dashboard" />
          </SidebarProvider>
        </TooltipProvider>
      </MemoryRouter>
    );

    for (const title of ['Debt', 'Tax', 'Legal Entities', 'Profile']) {
      expect(
        screen.getByRole('button', { name: `${title} — Not available` })
      ).toBeDisabled();
      expect(
        screen.queryByRole('link', { name: title })
      ).not.toBeInTheDocument();
    }
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
