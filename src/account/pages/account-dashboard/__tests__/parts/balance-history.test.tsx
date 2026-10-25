import { BalanceHistory } from '@/account/pages/account-dashboard/parts/balance-history';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('BalanceHistory', () => {
  it('prioritizes loading, shows the owned error, and retains period controls across states', async () => {
    const onPeriodChange = vi.fn();

    const { rerender } = render(
      <BalanceHistory
        period="6M"
        onPeriodChange={onPeriodChange}
        loading
        error
      />
    );

    expect(
      screen.getByRole('status', { name: 'Loading balance history' })
    ).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No balance history yet')
    ).not.toBeInTheDocument();

    rerender(
      <BalanceHistory
        period="6M"
        onPeriodChange={onPeriodChange}
        loading={false}
        error
      />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Couldn’t load balance history'
    );
    expect(
      screen.getByRole('heading', { name: 'Balance growth' })
    ).toBeVisible();
    expect(
      screen.queryByText('No balance history yet')
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: '1M' }));
    expect(onPeriodChange).toHaveBeenCalledWith('1M');

    rerender(
      <BalanceHistory
        period="1M"
        onPeriodChange={onPeriodChange}
        loading={false}
        error={false}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Couldn’t load balance history'
    );

    rerender(
      <BalanceHistory
        period="1M"
        onPeriodChange={onPeriodChange}
        loading={false}
        error={false}
        history={{
          period: { from: '2026-09-23', to: '2026-10-23' },
          points: [],
        }}
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('No balance history yet')).toBeVisible();
    expect(screen.getByRole('tab', { name: '1M' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});
