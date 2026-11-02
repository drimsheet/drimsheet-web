import { Button } from '@/shared/components/button';
import { DateRangePicker } from '@/shared/components/date-range-picker';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const value = {
  startDate: new Date(2026, 0, 10),
  endDate: new Date(2026, 0, 20),
};

async function enterDate(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  date: string
) {
  const input = screen.getByRole('textbox', { name: label });
  await user.clear(input);
  await user.type(input, date);
}

describe('DateRangePicker', () => {
  it('renders one calendar month on mobile', async () => {
    const media = window.matchMedia('(max-width: 767px)');
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = () => ({ ...media, matches: true });
    const user = userEvent.setup();

    try {
      render(<DateRangePicker value={value} onChange={vi.fn()} />);
      await user.click(screen.getByRole('button', { name: 'Date range' }));
      expect(screen.getAllByRole('grid')).toHaveLength(1);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('displays the committed range without emitting a change on mount', () => {
    const onChange = vi.fn();
    render(<DateRangePicker value={value} onChange={onChange} />);
    expect(
      screen.getByRole('button', { name: 'Date range' })
    ).toHaveTextContent('10 Jan 2026 – 20 Jan 2026');
    expect(
      screen.getByRole('button', { name: 'Date range' })
    ).toHaveAccessibleDescription('10 Jan 2026 – 20 Jan 2026');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('opens empty with Apply disabled', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker onChange={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Date range' }));
    expect(screen.getByRole('textbox', { name: 'Start date' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'End date' })).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('edits styled date fields within a single calendar popover until Apply', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker value={value} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Date range' }));
    await enterDate(user, 'Start date', '2026-01-12');
    await user.click(screen.getByRole('textbox', { name: 'End date' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getAllByRole('grid')).toHaveLength(2);
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      startDate: new Date(2026, 0, 12),
      endDate: value.endDate,
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each(['Cancel', 'Escape', 'outside'])(
    'discards uncommitted edits on %s',
    async (dismissal) => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <>
          <DateRangePicker value={value} onChange={onChange} />
          <button type="button">Outside</button>
        </>
      );
      await user.click(screen.getByRole('button', { name: 'Date range' }));
      await enterDate(user, 'Start date', '2026-01-12');
      if (dismissal === 'Cancel') {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      } else if (dismissal === 'Escape') {
        await user.keyboard('{Escape}');
      } else {
        await user.click(screen.getByRole('button', { name: 'Outside' }));
      }

      expect(onChange).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Date range' }));
      expect(screen.getByRole('textbox', { name: 'Start date' })).toHaveValue(
        '2026-01-10'
      );
    }
  );

  it('rejects invalid, reversed and incomplete text entry with translated feedback', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker value={value} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Date range' }));
    await enterDate(user, 'Start date', '2026-02-30');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter valid dates.');
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await enterDate(user, 'Start date', '2026-01-21');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The start date must be on or before the end date.'
    );
    expect(screen.getByLabelText('Start date')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await user.clear(screen.getByRole('textbox', { name: 'Start date' }));
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('selects a single day and an ordered range from reverse calendar clicks', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker minDate={new Date(2026, 0, 1)} onChange={onChange} />
    );
    await user.click(screen.getByRole('button', { name: 'Date range' }));
    await user.click(
      screen.getByRole('button', { name: /January 20th, 2026/ })
    );
    expect(screen.getByRole('textbox', { name: 'Start date' })).toHaveValue(
      '2026-01-20'
    );
    expect(screen.getByRole('textbox', { name: 'End date' })).toHaveValue(
      '2026-01-20'
    );
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
    await user.click(
      screen.getByRole('button', { name: /January 10th, 2026/ })
    );
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenLastCalledWith(value);
  });

  it('enforces inclusive boundaries in the range calendar and text fields', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        value={value}
        minDate={new Date(2026, 0, 10, 15)}
        maxDate={new Date(2026, 0, 20, 15)}
        onChange={onChange}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Date range' }));
    expect(
      screen.getByRole('button', { name: /January 9th, 2026/ })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /January 21st, 2026/ })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /January 10th, 2026/ })
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /January 20th, 2026/ })
    ).toBeEnabled();
    await enterDate(user, 'Start date', '2026-01-09');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose dates within the allowed range.'
    );
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await enterDate(user, 'Start date', '2026-01-10');
    await enterDate(user, 'End date', '2026-01-21');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose dates within the allowed range.'
    );
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports side-panel selections as uncommitted drafts', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        minDate={new Date(2026, 0, 1)}
        onChange={onChange}
        renderSidePanel={({ onChange: selectRange }) => (
          <Button onClick={() => selectRange(value)}>Example range</Button>
        )}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Date range' }));
    await user.click(screen.getByRole('button', { name: 'Example range' }));
    expect(screen.getByRole('textbox', { name: 'Start date' })).toHaveValue(
      '2026-01-10'
    );
    expect(screen.getByRole('textbox', { name: 'End date' })).toHaveValue(
      '2026-01-20'
    );
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenLastCalledWith(value);
  });

  it('resets an open draft to updated controlled values and boundaries', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <DateRangePicker value={value} onChange={onChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Date range' }));
    await enterDate(user, 'Start date', '2026-01-12');

    const next = {
      startDate: new Date(2026, 1, 1),
      endDate: new Date(2026, 1, 15),
    };

    rerender(<DateRangePicker value={next} onChange={onChange} />);
    expect(screen.getByRole('textbox', { name: 'Start date' })).toHaveValue(
      '2026-02-01'
    );
    expect(screen.getByRole('textbox', { name: 'End date' })).toHaveValue(
      '2026-02-15'
    );
    rerender(
      <DateRangePicker
        value={next}
        minDate={new Date(2026, 1, 5)}
        onChange={onChange}
      />
    );
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose dates within the allowed range.'
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('preserves drafts across equivalent parent renders', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <DateRangePicker value={value} onChange={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: 'Date range' }));
    await enterDate(user, 'Start date', '2026-01-12');
    rerender(
      <DateRangePicker
        value={{
          startDate: new Date(value.startDate),
          endDate: new Date(value.endDate),
        }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole('textbox', { name: 'Start date' })).toHaveValue(
      '2026-01-12'
    );
  });

  it('supports custom trigger text and disables opening', async () => {
    const user = userEvent.setup();
    render(
      <DateRangePicker
        disabled
        triggerLabel="January"
        ariaLabel="Reporting dates"
        onChange={vi.fn()}
      />
    );
    const trigger = screen.getByRole('button', { name: 'Reporting dates' });
    expect(trigger).toHaveTextContent('January');
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
