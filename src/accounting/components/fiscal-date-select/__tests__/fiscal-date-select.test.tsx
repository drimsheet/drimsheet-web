import { FiscalDateSelect } from '@/accounting/components/fiscal-date-select';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

describe('FiscalDateSelect', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.hasPointerCapture = vi.fn(
      () => false
    ) as unknown as typeof window.HTMLElement.prototype.hasPointerCapture;
    window.HTMLElement.prototype.releasePointerCapture =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.releasePointerCapture;
    window.HTMLElement.prototype.setPointerCapture =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.setPointerCapture;
    window.HTMLElement.prototype.scrollIntoView =
      vi.fn() as unknown as typeof window.HTMLElement.prototype.scrollIntoView;
  });

  it('renders correctly with no initial value', () => {
    const onChange = vi.fn();
    render(
      <FiscalDateSelect
        label="When does your financial year start?"
        value={undefined as unknown as Date}
        onChange={onChange}
      />
    );

    expect(
      screen.getByText('When does your financial year start?')
    ).toBeInTheDocument();
  });

  it('renders correctly with an initial value', () => {
    const onChange = vi.fn();
    render(
      <FiscalDateSelect
        label="When does your financial year start?"
        value={new Date(2024, 3, 15)}
        onChange={onChange}
      />
    );

    expect(
      screen.getByRole('button', { name: /Apr.*15.*2024|15.*Apr.*2024/i })
    ).toBeInTheDocument();
  });

  it('opens the calendar and selects a date', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FiscalDateSelect
        label="When does your financial year start?"
        value={new Date(2024, 0, 1)}
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole('button', {
      name: /Jan.*1.*2024|1.*Jan.*2024/i,
    });

    await user.click(trigger);

    const day15 = screen.getByText('15');
    await user.click(day15);

    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    const calledWith = onChange.mock.calls[0][0];
    expect(calledWith.getMonth()).toBe(0);
    expect(calledWith.getDate()).toBe(15);
  });

  it('displays an error when error prop is provided', () => {
    const onChange = vi.fn();
    render(
      <FiscalDateSelect
        label="When does your financial year start?"
        value={new Date(2024, 0, 1)}
        onChange={onChange}
        error="Date is required"
      />
    );

    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });
});
