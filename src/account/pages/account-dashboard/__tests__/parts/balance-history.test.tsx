import { BalanceHistory } from '@/account/pages/account-dashboard/parts/balance-history';
import { ReportingIntervalSelect } from '@/reporting/components/reporting-interval-select';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('BalanceHistory', () => {
  it('prioritizes loading, shows the owned error, and retains period controls across states', async () => {
    const onChange = vi.fn();
    const intervalSlot = <ReportingIntervalSelect onChange={onChange} />;

    const { rerender } = render(
      <BalanceHistory
        intervalSlot={intervalSlot}
        showHistory={false}
        loading={false}
        error={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Interval' })).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<BalanceHistory intervalSlot={intervalSlot} loading error />);

    expect(
      screen.getByRole('status', { name: 'Loading balance history' })
    ).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No balance history yet')
    ).not.toBeInTheDocument();

    rerender(
      <BalanceHistory intervalSlot={intervalSlot} loading={false} error />
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

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Interval' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Start date' }),
      '2026-09-23'
    );
    await user.type(
      screen.getByRole('textbox', { name: 'End date' }),
      '2026-10-23'
    );
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenLastCalledWith({
      type: 'custom',
      startDate: new Date(2026, 8, 23),
      endDate: new Date(2026, 9, 23),
    });

    rerender(
      <BalanceHistory
        intervalSlot={intervalSlot}
        loading={false}
        error={false}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Couldn’t load balance history'
    );

    rerender(
      <BalanceHistory
        intervalSlot={intervalSlot}
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
    expect(screen.getByRole('button', { name: 'Interval' })).toHaveTextContent(
      '23 Sept 2026 – 23 Oct 2026'
    );
  });
});
