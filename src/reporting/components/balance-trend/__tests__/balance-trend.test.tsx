const labels = {
  chartLabel: 'Balance growth',
  balanceLabel: 'Total balance',
  dateLabel: 'Date',
  dataLabel: 'View chart data',
  emptyTitle: 'No balance history yet',
  inactiveTitle: 'No balance activity yet',
  emptyDescription:
    'Growth will appear once balances are recorded on different dates.',
  loadingLabel: 'Loading balance history',
  errorTitle: 'Couldn’t load balance history',
  errorDescription: 'Refresh the page to try again.',
};

import {
  BalanceTrend,
  BalanceTrendWithState,
} from '@/reporting/components/balance-trend';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('BalanceTrend empty states', () => {
  it('distinguishes missing history from observed zero balances', () => {
    const { rerender } = render(<BalanceTrend labels={labels} points={[]} />);
    expect(screen.getByText('No balance history yet')).toBeInTheDocument();
    rerender(
      <BalanceTrend
        labels={labels}
        points={['2026-04-23', '2026-10-23'].map((date) => ({
          date,
          amount: { amount: 0, currencyCode: 'NGN', isMinorUnit: false },
        }))}
      />
    );
    expect(screen.getByText('No balance activity yet')).toBeInTheDocument();
    expect(
      screen.queryByText('No balance history yet')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('application')).not.toBeInTheDocument();
  });
});

describe('BalanceTrendWithState', () => {
  it.each([undefined, null])(
    'shows an error for missing points (%s)',
    (points) => {
      const { rerender } = render(
        <BalanceTrendWithState labels={labels} points={points} />
      );

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Couldn’t load balance history'
      );
      rerender(
        <BalanceTrendWithState
          labels={labels}
          state="success"
          points={points}
        />
      );
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Couldn’t load balance history'
      );
      expect(
        screen.queryByText('No balance history yet')
      ).not.toBeInTheDocument();
    }
  );

  it('keeps loading with missing or cached points', () => {
    const { rerender } = render(
      <BalanceTrendWithState labels={labels} state="loading" />
    );

    expect(
      screen.getByRole('status', { name: 'Loading balance history' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    rerender(
      <BalanceTrendWithState labels={labels} state="loading" points={[]} />
    );
    expect(
      screen.getByRole('status', { name: 'Loading balance history' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No balance history yet')
    ).not.toBeInTheDocument();
  });

  it('honors an error even with cached points', () => {
    render(<BalanceTrendWithState labels={labels} state="error" points={[]} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Couldn’t load balance history'
    );
    expect(
      screen.queryByText('No balance history yet')
    ).not.toBeInTheDocument();
  });

  it('defaults to success and treats an empty array as valid history', () => {
    render(<BalanceTrendWithState labels={labels} points={[]} />);
    expect(screen.getByText('No balance history yet')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

it('uses caller-provided empty, loading, and error copy', () => {
  const customLabels = {
    ...labels,
    emptyTitle: 'No observations',
    loadingLabel: 'Loading observations',
    errorTitle: 'Observations unavailable',
    errorDescription: 'Check back later.',
  };

  const { rerender } = render(
    <BalanceTrendWithState points={[]} labels={customLabels} />
  );

  expect(screen.getByText('No observations')).toBeVisible();
  rerender(<BalanceTrendWithState state="loading" labels={customLabels} />);
  expect(
    screen.getByRole('status', { name: 'Loading observations' })
  ).toBeInTheDocument();
  rerender(<BalanceTrendWithState state="error" labels={customLabels} />);
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Observations unavailable'
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Check back later.');
});
