import { CounterpartyShare } from '@/account/pages/category-details/parts/counterparty-share';
import type { CounterpartyShareProps } from '@/account/pages/category-details/types';
import type { IAccountCounterpartyParticipationDto } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const row: IAccountCounterpartyParticipationDto = {
  counterparty: null,
  isSelf: true,
  participation: {
    totalShare: 33.33,
    functionalAmount: { amount: 1000, currencyCode: 'NGN', isMinorUnit: false },
    amount: { amount: 1, currencyCode: 'USD', isMinorUnit: false },
  },
};

function props(
  overrides: Partial<CounterpartyShareProps> = {}
): CounterpartyShareProps {
  return {
    counterparties: [row],
    loading: false,
    error: false,
    selectedId: 'self',
    onSelect: vi.fn(),
    onPageChange: vi.fn(),
    onRetry: vi.fn(),
    ...overrides,
  };
}

describe('CounterpartyShare', () => {
  it('uses API percentages and functional amounts and selects rows with the keyboard', async () => {
    const user = userEvent.setup();
    const values = props();
    render(<CounterpartyShare {...values} />);
    const button = screen.getByRole('button', { name: /Self/ });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveTextContent('33.33%');
    expect(button).toHaveTextContent('₦1,000');
    button.focus();
    await user.keyboard('{Enter}');
    expect(values.onSelect).toHaveBeenCalledWith(row);
  });
  it.each([125.25, -25.25, null])(
    'preserves the API share %s without a misleading bar',
    (share) => {
      render(
        <CounterpartyShare
          {...props({
            counterparties: [
              {
                ...row,
                isSelf: false,
                participation: { ...row.participation, totalShare: share },
              },
            ],
          })}
        />
      );
      const button = screen.getByRole('button', { name: /Unassigned/ });
      expect(button.querySelector('[aria-hidden="true"]')).toBeNull();
      if (share === null)
        expect(
          screen.getByLabelText('Share unavailable at zero balance')
        ).toHaveTextContent('—');
      else expect(button).toHaveTextContent(`${share}%`);
    }
  );
  it('delegates pagination to the container', async () => {
    const user = userEvent.setup();

    const values = props({
      pagination: { page: 1, limit: 5, total: 6, totalPages: 2 },
    });

    render(<CounterpartyShare {...values} />);
    expect(
      screen.getByRole('button', { name: 'Previous counterparties' })
    ).toBeDisabled();
    await user.click(
      screen.getByRole('button', { name: 'Next counterparties' })
    );
    expect(values.onPageChange).toHaveBeenCalledWith(2);
  });
  it('does not show an empty state while loading or after failure and supports retry', async () => {
    const values = props({ counterparties: [], loading: true });
    const { rerender } = render(<CounterpartyShare {...values} />);
    expect(
      screen.getByRole('status', { name: 'Loading counterparty share' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('No counterparty activity yet.')
    ).not.toBeInTheDocument();
    rerender(<CounterpartyShare {...values} loading={false} error />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.queryByText('No counterparty activity yet.')
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(values.onRetry).toHaveBeenCalledOnce();
  });
  it('shows the empty state', () => {
    const values = props({ counterparties: [] });
    render(<CounterpartyShare {...values} />);
    expect(
      screen.getByText('No counterparty activity yet.')
    ).toBeInTheDocument();
  });
});
