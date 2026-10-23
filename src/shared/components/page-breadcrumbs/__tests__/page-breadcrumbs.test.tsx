import { PageBreadcrumbs } from '@/shared/components/page-breadcrumbs';
import * as stories from '@/shared/components/page-breadcrumbs/__stories__/page-breadcrumbs.stories';
import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

const { PettyCashAccount, CurrentPage } = composeStories(stories);

describe('PageBreadcrumbs', () => {
  it('renders a petty cash account breadcrumb from configuration', () => {
    render(<PettyCashAccount />);

    expect(screen.getByLabelText('breadcrumb')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Petty Cash' })).toHaveAttribute(
      'href',
      '/accounts/petty-cash'
    );
    expect(screen.getByRole('link', { name: 'Office Float' })).toHaveAttribute(
      'href',
      '#'
    );
  });

  it('renders a final crumb as the current page when no link is configured', () => {
    render(<CurrentPage />);

    expect(screen.getByRole('link', { name: 'Accounts' })).toHaveAttribute(
      'href',
      '/accounts'
    );
    expect(screen.getByText('Petty Cash')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('renders every crumb in a nested chain', () => {
    render(
      <MemoryRouter>
        <PageBreadcrumbs
          breadcrumb={{
            label: 'Accounts',
            link: '/accounts',
            next: {
              label: 'Petty Cash',
              link: '/accounts/petty-cash',
              next: {
                label: 'Office Float',
              },
            },
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Petty Cash')).toBeInTheDocument();
    expect(screen.getByText('Office Float')).toBeInTheDocument();
  });

  it('keeps the breadcrumb region while pending and restores navigation when loaded', () => {
    const breadcrumb = {
      label: 'Accounts',
      link: '/accounts',
      next: { label: 'Office Float' },
    };

    const { rerender } = render(
      <MemoryRouter>
        <PageBreadcrumbs breadcrumb={breadcrumb} isLoading />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('navigation', { name: 'breadcrumb' })
    ).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.queryByRole('link', { name: 'Accounts' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Office Float')).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <PageBreadcrumbs breadcrumb={breadcrumb} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('navigation', { name: 'breadcrumb' })
    ).not.toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('link', { name: 'Accounts' })).toHaveAttribute(
      'href',
      '/accounts'
    );
    expect(screen.getByText('Office Float')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
