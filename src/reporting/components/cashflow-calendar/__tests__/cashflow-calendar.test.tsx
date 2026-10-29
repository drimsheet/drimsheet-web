import {
  CashflowCalendar,
  CashflowCalendarWithState,
  type CashflowCalendarProps,
} from '@/reporting/components/cashflow-calendar';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

const props: CashflowCalendarProps = {
  date: new Date(2026, 9, 26),
  today: new Date(2026, 9, 26),
  onDateChange: () => {},
  labels: {
    calendarLabel: 'Cash flow',
    previousLabel: 'Previous period',
    nextLabel: 'Next period',
    inflowLabel: 'Inflow',
    outflowLabel: 'Outflow',
  },
  days: [
    {
      date: '2026-10-26',
      in: { amount: 120000, currencyCode: 'USD', isMinorUnit: true },
      out: { amount: 85, currencyCode: 'USD', isMinorUnit: false },
    },
  ],
};

it('renders Monday-first month dates with compact and exact flows', () => {
  render(<CashflowCalendar {...props} />);
  expect(
    screen.getAllByRole('columnheader').map((cell) => cell.textContent)
  ).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const day = screen.getByRole('cell', { name: /October 26, 2026/ });
  expect(within(day).getByText('+$1.2K')).toBeInTheDocument();
  expect(within(day).getByText('$1,200')).toBeInTheDocument();
  expect(within(day).getByText('-$85')).toBeInTheDocument();
  expect(screen.getAllByRole('row')).toHaveLength(6);
});

it('shows a seven-day week across month boundaries', () => {
  render(<CashflowCalendar {...props} variant="week" />);
  expect(screen.getAllByRole('cell')).toHaveLength(7);
  expect(
    screen.getByRole('cell', { name: /November 1, 2026/ })
  ).toBeInTheDocument();
});

it.each(['primary', 'secondary'] as const)(
  'marks today using the %s background and paired text',
  (color) => {
    render(<CashflowCalendar {...props} color={color} />);

    const today = within(
      screen.getByRole('cell', { name: /October 26, 2026/ })
    ).getByText('26');

    expect(today).toHaveAttribute('aria-current', 'date');
    expect(today).toHaveClass(`bg-${color}`, `text-${color}-foreground`);
  }
);

it.each(['month', 'week'] as const)(
  'emits controlled %s navigation and prevents navigating past today',
  async (variant) => {
    const onDateChange = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <CashflowCalendar
        {...props}
        variant={variant}
        onDateChange={onDateChange}
      />
    );

    expect(screen.getByRole('button', { name: 'Next period' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Previous period' }));

    const previous =
      variant === 'month' ? new Date(2026, 8, 1) : new Date(2026, 9, 19);

    expect(onDateChange).toHaveBeenLastCalledWith(previous);
    rerender(
      <CashflowCalendar
        {...props}
        date={previous}
        variant={variant}
        onDateChange={onDateChange}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Next period' }));
    expect(onDateChange).toHaveBeenLastCalledWith(
      variant === 'month' ? new Date(2026, 9, 1) : new Date(2026, 9, 26)
    );
  }
);

it('keeps an empty calendar distinct from missing data and loading/error states', () => {
  const { rerender } = render(
    <CashflowCalendarWithState
      {...props}
      state="loading"
      loadingLabel="Loading cash flow"
    />
  );

  expect(screen.getByRole('status')).toHaveTextContent('Loading cash flow');
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  rerender(
    <CashflowCalendarWithState
      {...props}
      days={[]}
      loadingLabel="Loading cash flow"
    />
  );
  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  rerender(
    <CashflowCalendarWithState
      {...props}
      days={null}
      loadingLabel="Loading cash flow"
    />
  );
  expect(screen.getByRole('alert')).toBeVisible();
  rerender(
    <CashflowCalendarWithState
      {...props}
      state="error"
      loadingLabel="Loading cash flow"
    />
  );
  expect(screen.getByRole('alert')).toBeVisible();
  expect(screen.getByRole('table')).toBeInTheDocument();
});

it.each(['month', 'week'] as const)(
  'preserves headings and navigation in the %s error state',
  async (variant) => {
    const onDateChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CashflowCalendarWithState
        {...props}
        variant={variant}
        state="error"
        loadingLabel="Loading cash flow"
        onDateChange={onDateChange}
      />
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect(screen.getByRole('heading')).toBeVisible();
    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next period' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Previous period' }));
    expect(onDateChange).toHaveBeenCalledWith(
      variant === 'month' ? new Date(2026, 8, 1) : new Date(2026, 9, 19)
    );
  }
);
