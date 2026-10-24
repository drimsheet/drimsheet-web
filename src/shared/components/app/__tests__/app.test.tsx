import { AppBody } from '@/shared/components/app';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

describe('AppBody', () => {
  it('renders the title as the primary heading with its content', () => {
    render(
      <AppBody title="Accounts">
        <p>Balances</p>
      </AppBody>
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Accounts' })
    ).toBeVisible();
    expect(screen.getByText('Balances')).toBeVisible();
  });

  it('prefers inline title content and keeps a single h1', () => {
    render(
      <AppBody
        title="Fallback"
        titleSlot={
          <>
            Accounts <Badge>Archived</Badge>
          </>
        }
      />
    );

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Accounts Archived',
    });

    expect(within(heading).getByText('Archived')).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.queryByText('Fallback')).not.toBeInTheDocument();
  });

  it('uses the string title when the slot is null', () => {
    render(<AppBody title="Accounts" titleSlot={null} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Accounts' })
    ).toBeVisible();
  });

  it('renders breadcrumbs independently of the heading', () => {
    render(
      <MemoryRouter>
        <AppBody
          breadcrumbs={{
            label: 'Accounts',
            link: '/accounts',
            next: { label: 'Operating account' },
          }}
        />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'Accounts' })).toHaveAttribute(
      'href',
      '/accounts'
    );
    expect(screen.getByText('Operating account')).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('keeps actions usable without a heading', async () => {
    const onClick = vi.fn();
    render(
      <AppBody
        actionsSlot={<Button onClick={onClick}>Create account</Button>}
      />
    );
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Create account' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it.each([undefined, null, false, ''])(
    'omits the header for empty optional content (%s)',
    (empty) => {
      const { container } = render(
        <AppBody titleSlot={empty} actionsSlot={empty}>
          <p>Custom content</p>
        </AppBody>
      );

      expect(container.querySelector('header')).toBeNull();
      expect(screen.getByText('Custom content')).toBeVisible();
    }
  );

  it('does not fall back to the title when the slot is false', () => {
    const { container } = render(
      <AppBody title="Fallback" titleSlot={false} actionsSlot={false} />
    );

    expect(container.querySelector('header')).toBeNull();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
