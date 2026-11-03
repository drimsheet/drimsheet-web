import { ReportingIntervalSelect } from '@/reporting/components/reporting-interval-select';
import type { IReportingInterval } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const interval: IReportingInterval = {
  id: 'interval',
  accountingEntityId: 'entity',
  fiscalYearId: 'year',
  createdBy: 'user',
  createdAt: '2024-02-01T00:00:00.000Z',
  updatedAt: '2024-02-01T00:00:00.000Z',
  unit: 'month',
  count: 2,
  currentPeriodOrdinal: 0,
  startDate: '2024-02-01T00:00:00.000Z',
  endDate: '2024-04-01T00:00:00.000Z',
  nextPeriodStartDate: '2024-03-01T00:00:00.000Z',
  periods: [
    {
      id: 'february',
      intervalId: 'interval',
      accountingEntityId: 'entity',
      createdBy: 'user',
      createdAt: '2024-02-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
      ordinal: 0,
      name: 'February',
      startDate: '2024-02-01T00:00:00.000Z',
      endDate: '2024-03-01T00:00:00.000Z',
    },
    {
      id: 'march',
      intervalId: 'interval',
      accountingEntityId: 'entity',
      createdBy: 'user',
      createdAt: '2024-02-01T00:00:00.000Z',
      updatedAt: '2024-02-01T00:00:00.000Z',
      ordinal: 1,
      name: 'March',
      startDate: '2024-03-01T00:00:00.000Z',
      endDate: '2024-04-01T00:00:00.000Z',
    },
  ],
};

function trigger() {
  return screen.getByRole('button', { name: 'Interval' });
}

describe('ReportingIntervalSelect', () => {
  it('initializes the current reporting period with its inclusive end date', () => {
    const onChange = vi.fn();
    render(<ReportingIntervalSelect interval={interval} onChange={onChange} />);
    expect(trigger()).toHaveTextContent('February');
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      type: 'period',
      ordinal: 0,
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 1, 29),
    });
  });

  it('commits another reporting period only on Apply', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ReportingIntervalSelect interval={interval} onChange={onChange} />);
    onChange.mockClear();
    await user.click(trigger());
    await user.click(screen.getByRole('radio', { name: 'March' }));
    expect(screen.getByRole('textbox', { name: 'End date' })).toHaveValue(
      '2024-03-31'
    );
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      type: 'period',
      ordinal: 1,
      startDate: new Date(2024, 2, 1),
      endDate: new Date(2024, 2, 31),
    });
  });

  it('commits All time with the last included day of the reporting interval', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ReportingIntervalSelect interval={interval} onChange={onChange} />);
    await user.click(trigger());
    await user.click(screen.getByRole('radio', { name: 'All time' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenLastCalledWith({
      type: 'all-time',
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 2, 31),
    });
  });

  it('bounds custom dates by the inclusive interval end and forwards date formatting preferences', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ReportingIntervalSelect
        interval={interval}
        countryCode="US"
        onChange={onChange}
      />
    );
    onChange.mockClear();
    await user.click(trigger());
    const endInput = screen.getByRole('textbox', { name: 'End date' });
    await user.clear(endInput);
    await user.paste('2024-04-01');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose dates within the allowed range.'
    );
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
    await user.clear(endInput);
    await user.paste('2024-03-31');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      type: 'custom',
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 2, 31),
    });
    expect(trigger()).toHaveTextContent('Feb 1 2024 – Mar 31 2024');
  });

  it.each([undefined, null])(
    'supports missing reporting data: %s',
    async (input) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ReportingIntervalSelect interval={input} onChange={onChange} />);
      expect(onChange).toHaveBeenCalledExactlyOnceWith({ type: 'custom' });
      await user.click(trigger());
      expect(screen.getByRole('radio', { name: 'Custom' })).toBeChecked();
      expect(
        screen.queryByRole('radio', { name: 'All time' })
      ).not.toBeInTheDocument();
    }
  );

  it('falls back to All time when there are no reporting periods', () => {
    const onChange = vi.fn();
    render(
      <ReportingIntervalSelect
        interval={{ ...interval, periods: [] }}
        onChange={onChange}
      />
    );
    expect(trigger()).toHaveTextContent('All time');
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      type: 'all-time',
      startDate: new Date(2024, 1, 1),
      endDate: new Date(2024, 2, 31),
    });
  });

  it.each(['accountingEntityId', 'fiscalYearId', 'id'] as const)(
    'resets the selection when %s changes even if the dates and ordinals are identical',
    async (field) => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const { rerender } = render(
        <ReportingIntervalSelect interval={interval} onChange={onChange} />
      );

      await user.click(trigger());
      await user.click(screen.getByRole('radio', { name: 'Custom' }));
      await user.click(screen.getByRole('button', { name: 'Apply' }));
      expect(onChange).toHaveBeenLastCalledWith({
        type: 'custom',
        startDate: new Date(2024, 1, 1),
        endDate: new Date(2024, 1, 29),
      });
      rerender(
        <ReportingIntervalSelect
          interval={{ ...interval, [field]: 'another' }}
          onChange={onChange}
        />
      );
      expect(trigger()).toHaveTextContent('February');
      expect(onChange).toHaveBeenLastCalledWith({
        type: 'period',
        ordinal: 0,
        startDate: new Date(2024, 1, 1),
        endDate: new Date(2024, 1, 29),
      });
    }
  );

  it('preserves an open selection draft across equivalent API responses', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <ReportingIntervalSelect interval={interval} onChange={onChange} />
    );

    await user.click(trigger());
    await user.click(screen.getByRole('radio', { name: 'March' }));
    rerender(
      <ReportingIntervalSelect
        interval={structuredClone(interval)}
        onChange={onChange}
      />
    );
    expect(screen.getByRole('radio', { name: 'March' })).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('forwards the disabled state', () => {
    render(
      <ReportingIntervalSelect
        interval={interval}
        disabled
        onChange={vi.fn()}
      />
    );
    expect(trigger()).toBeDisabled();
  });
});
