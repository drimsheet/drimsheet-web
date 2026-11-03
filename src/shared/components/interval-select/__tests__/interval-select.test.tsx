import {
  IntervalSelect,
  type IInterval,
} from '@/shared/components/interval-select';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const january = {
  ordinal: 0,
  name: 'January',
  startDate: new Date(2026, 0, 1),
  endDate: new Date(2026, 0, 31),
};

const february = {
  ordinal: 2,
  name: 'February',
  startDate: new Date(2026, 1, 1),
  endDate: new Date(2026, 1, 28),
};

const interval: IInterval = {
  periods: [january, february],
  currentPeriodOrdinal: 0,
  startDate: january.startDate,
  endDate: february.endDate,
};

async function enterDate(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  value: string
) {
  const input = screen.getByRole('textbox', { name: label });
  await user.clear(input);
  await user.type(input, value);
}

function trigger() {
  return screen.getByRole('button', { name: 'Interval' });
}

describe('IntervalSelect', () => {
  it('renders a single picker trigger and reports the current period on initialization', () => {
    const onChange = vi.fn();
    render(<IntervalSelect interval={interval} onChange={onChange} />);
    expect(trigger()).toHaveTextContent('January');
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith({
      type: 'period',
      ordinal: 0,
      startDate: january.startDate,
      endDate: january.endDate,
    });
  });

  it('previews a period and commits its ordinal only on Apply', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<IntervalSelect interval={interval} onChange={onChange} />);
    onChange.mockClear();
    await user.click(trigger());
    expect(screen.getAllByRole('grid')).toHaveLength(2);
    await user.click(screen.getByRole('radio', { name: 'February' }));
    expect(screen.getByRole('radio', { name: 'February' })).toBeChecked();
    expect(screen.getByRole('textbox', { name: 'Start date' })).toHaveValue(
      '2026-02-01'
    );
    expect(screen.getByRole('textbox', { name: 'End date' })).toHaveValue(
      '2026-02-28'
    );
    expect(trigger()).toHaveTextContent('January');
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(trigger()).toHaveTextContent('February');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      type: 'period',
      ordinal: 2,
      startDate: february.startDate,
      endDate: february.endDate,
    });
  });

  it('commits all time using the complete interval boundaries', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<IntervalSelect interval={interval} onChange={onChange} />);
    onChange.mockClear();
    await user.click(trigger());
    await user.click(screen.getByRole('radio', { name: 'All time' }));
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(trigger()).toHaveTextContent('All time');
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      type: 'all-time',
      startDate: interval.startDate,
      endDate: interval.endDate,
    });
  });

  it.each([
    undefined,
    { periods: [] },
    { periods: [], startDate: january.startDate },
    { periods: [], endDate: january.endDate },
  ])(
    'offers Custom and omits All time without both boundaries: %j',
    async (input) => {
      const user = userEvent.setup();
      render(<IntervalSelect interval={input} onChange={vi.fn()} />);
      expect(trigger()).toHaveTextContent('Select date range');
      await user.click(trigger());
      expect(screen.getByRole('radio', { name: 'Custom' })).toBeChecked();
      expect(
        screen.queryByRole('radio', { name: 'All time' })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    }
  );

  it.each([undefined, 999])(
    'defaults to all time when current period %s is unavailable',
    (currentPeriodOrdinal) => {
      render(
        <IntervalSelect
          interval={{ ...interval, currentPeriodOrdinal }}
          onChange={vi.fn()}
        />
      );
      expect(trigger()).toHaveTextContent('All time');
    }
  );

  it('commits explicit Custom even when its dates match a period', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<IntervalSelect interval={interval} onChange={onChange} />);
    await user.click(trigger());
    await user.click(screen.getByRole('radio', { name: 'Custom' }));
    expect(screen.getByRole('textbox', { name: 'Start date' })).toHaveValue(
      '2026-01-01'
    );
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenLastCalledWith({
      type: 'custom',
      startDate: january.startDate,
      endDate: january.endDate,
    });
    expect(trigger()).toHaveTextContent('1 Jan 2026 – 31 Jan 2026');
  });

  it('switches to Custom when dates are edited, including when restored to the period dates', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<IntervalSelect interval={interval} onChange={onChange} />);
    onChange.mockClear();
    await user.click(trigger());
    await enterDate(user, 'Start date', '2026-01-02');
    expect(screen.getByRole('radio', { name: 'Custom' })).toBeChecked();
    await enterDate(user, 'Start date', '2026-01-01');
    expect(screen.getByRole('radio', { name: 'Custom' })).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      type: 'custom',
      startDate: january.startDate,
      endDate: january.endDate,
    });
  });

  it('selects an ordered custom calendar range within inclusive boundaries', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <IntervalSelect
        interval={{
          periods: [],
          startDate: new Date(2026, 0, 10, 15),
          endDate: new Date(2026, 0, 20, 15),
        }}
        onChange={onChange}
      />
    );
    onChange.mockClear();
    await user.click(trigger());
    expect(
      screen.getByRole('button', { name: /January 9th, 2026/ })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /January 21st, 2026/ })
    ).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Custom' }));
    await user.click(
      screen.getByRole('button', { name: /January 10th, 2026/ })
    );
    await user.click(
      screen.getByRole('button', { name: /January 20th, 2026/ })
    );
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      type: 'custom',
      startDate: new Date(2026, 0, 10),
      endDate: new Date(2026, 0, 20),
    });
  });

  it.each(['Cancel', 'Escape', 'outside'])(
    'discards a draft option and restores its type on %s',
    async (dismissal) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <>
          <IntervalSelect
            interval={{
              ...interval,
              periods: [january],
              endDate: january.endDate,
            }}
            onChange={onChange}
          />
          <button type="button">Outside</button>
        </>
      );
      onChange.mockClear();
      await user.click(trigger());
      // All time deliberately has the same dates as the committed period.
      await user.click(screen.getByRole('radio', { name: 'All time' }));
      if (dismissal === 'Cancel') {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      } else if (dismissal === 'Escape') {
        await user.keyboard('{Escape}');
      } else {
        await user.click(screen.getByRole('button', { name: 'Outside' }));
      }

      expect(trigger()).toHaveTextContent('January');
      expect(onChange).not.toHaveBeenCalled();
      await user.click(trigger());
      expect(screen.getByRole('radio', { name: 'January' })).toBeChecked();
      await user.click(screen.getByRole('button', { name: 'Apply' }));
      expect(onChange).not.toHaveBeenCalled();
    }
  );

  it('preserves distinct period ordinals with identical ranges and date-only picker values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const duplicate = {
      ...january,
      ordinal: 9,
      name: 'Reporting period',
      startDate: new Date(2026, 0, 1, 15),
      endDate: new Date(2026, 0, 31, 15),
    };

    render(
      <IntervalSelect
        interval={{ ...interval, periods: [january, duplicate] }}
        onChange={onChange}
      />
    );
    await user.click(trigger());
    await user.click(screen.getByRole('radio', { name: 'Reporting period' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenLastCalledWith({
      type: 'period',
      ordinal: 9,
      startDate: duplicate.startDate,
      endDate: duplicate.endDate,
    });
  });

  it('refreshes selected period dates and falls back after the period is removed', () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <IntervalSelect interval={interval} onChange={onChange} />
    );

    const updatedPeriod = { ...january, endDate: new Date(2026, 0, 30) };
    rerender(
      <IntervalSelect
        interval={{ ...interval, periods: [updatedPeriod] }}
        onChange={onChange}
      />
    );
    expect(onChange).toHaveBeenLastCalledWith({
      type: 'period',
      ordinal: 0,
      startDate: january.startDate,
      endDate: updatedPeriod.endDate,
    });
    rerender(
      <IntervalSelect
        interval={{ ...interval, periods: [] }}
        onChange={onChange}
      />
    );
    expect(trigger()).toHaveTextContent('All time');
    expect(onChange).toHaveBeenLastCalledWith({
      type: 'all-time',
      startDate: interval.startDate,
      endDate: interval.endDate,
    });
    rerender(<IntervalSelect interval={interval} onChange={onChange} />);
    expect(trigger()).toHaveTextContent('All time');
  });

  it('follows changes to the supplied current period ordinal', () => {
    const { rerender } = render(
      <IntervalSelect interval={interval} onChange={vi.fn()} />
    );

    rerender(
      <IntervalSelect
        interval={{ ...interval, currentPeriodOrdinal: 2 }}
        onChange={vi.fn()}
      />
    );
    expect(trigger()).toHaveTextContent('February');
  });

  it('discards an open draft if its period is removed by a prop update', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <IntervalSelect interval={interval} onChange={onChange} />
    );

    await user.click(trigger());
    await user.click(screen.getByRole('radio', { name: 'February' }));
    rerender(
      <IntervalSelect
        interval={{ ...interval, periods: [january] }}
        onChange={onChange}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(trigger());
    expect(screen.getByRole('radio', { name: 'January' })).toBeChecked();
    expect(
      screen.queryByRole('radio', { name: 'February' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('clears an applied custom range outside updated boundaries', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <IntervalSelect interval={interval} onChange={onChange} />
    );

    await user.click(trigger());
    await user.click(screen.getByRole('radio', { name: 'Custom' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    rerender(
      <IntervalSelect
        interval={{ ...interval, startDate: new Date(2026, 0, 2) }}
        onChange={onChange}
      />
    );
    expect(trigger()).toHaveTextContent('Select date range');
    expect(onChange).toHaveBeenLastCalledWith({ type: 'custom' });
  });

  it('preserves an open draft across equivalent inputs and new callback identities', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <IntervalSelect interval={interval} onChange={onChange} />
    );

    await user.click(trigger());
    await user.click(screen.getByRole('radio', { name: 'February' }));
    const nextOnChange = vi.fn();
    rerender(
      <IntervalSelect
        interval={{
          ...interval,
          periods: interval.periods.map((period) => ({
            ...period,
            startDate: new Date(period.startDate),
            endDate: new Date(period.endDate),
          })),
        }}
        onChange={nextOnChange}
      />
    );
    expect(screen.getByRole('radio', { name: 'February' })).toBeChecked();
    expect(nextOnChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(nextOnChange).toHaveBeenLastCalledWith({
      type: 'period',
      ordinal: 2,
      startDate: february.startDate,
      endDate: february.endDate,
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('disables opening the interval picker', async () => {
    const user = userEvent.setup();
    render(<IntervalSelect disabled onChange={vi.fn()} />);
    expect(trigger()).toBeDisabled();
    await user.click(trigger());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
