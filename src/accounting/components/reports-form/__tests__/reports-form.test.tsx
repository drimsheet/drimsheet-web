import { ReportsForm } from '@/accounting/components/reports-form';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const financialYear = {
  name: 'FY 2026',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
};

const props = {
  currentDate: '2026-10-22',
  financialYear,
  currencies: [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
  ],
};

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('ReportsForm', () => {
  it('links the financial year and calculates reporting periods independently', () => {
    render(<ReportsForm {...props} />);
    const year = screen.getByRole('region', { name: 'Financial year' });
    expect(year).toHaveTextContent('FY 2026');
    expect(year).toHaveTextContent('Jan 1, 2026 – Dec 31, 2026');
    expect(
      screen.getByRole('textbox', { name: 'Quarter 4' })
    ).toHaveAccessibleDescription('Oct 1, 2026 – Dec 31, 2026 Current');
    expect(
      screen.getByRole('textbox', { name: 'Reporting setup name' })
    ).toHaveValue('');
  });
  it('requires a setup name, currency, and nonblank edited period names', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <ReportsForm {...props} id="reports-form" onSubmit={onSubmit} />
        <button type="submit" form="reports-form">
          Save
        </button>
      </>
    );
    await user.clear(screen.getByRole('textbox', { name: 'Quarter 1' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByText('Enter a reporting setup name.')
    ).toBeVisible();
    expect(
      screen.getByRole('combobox', { name: 'Currency for your reports' })
    ).toHaveAccessibleDescription('Select a currency for your reports.');
    expect(
      screen.getByRole('textbox', { name: 'Quarter 1' })
    ).toHaveAccessibleDescription(
      'Jan 1, 2026 – Mar 31, 2026 Enter a name for this period.'
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('emits the selected reporting currency, grouping, and calculated periods', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <ReportsForm {...props} id="reports-form" onSubmit={onSubmit} />
        <button type="submit" form="reports-form">
          Save
        </button>
      </>
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Reporting setup name' }),
      'Board pack'
    );
    await user.click(
      screen.getByRole('combobox', { name: 'Currency for your reports' })
    );
    await user.click(
      await screen.findByRole('option', { name: /Nigerian Naira/ })
    );
    await user.click(
      screen.getByRole('combobox', {
        name: 'How much time should each report cover?',
      })
    );
    await user.click(
      await screen.findByRole('option', { name: 'The whole financial year' })
    );
    await user.clear(
      screen.getByRole('textbox', { name: 'Whole financial year' })
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Whole financial year' }),
      'Annual report'
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Board pack',
        currencyCode: 'NGN',
        unit: 'year',
        periods: [
          {
            name: 'Annual report',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
          },
        ],
      })
    );
  });
  it('retains names when switching groupings and follows changes to the linked year', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ReportsForm {...props} />);
    await user.type(
      screen.getByRole('textbox', { name: 'Reporting setup name' }),
      'Board pack'
    );
    await user.clear(screen.getByRole('textbox', { name: 'Quarter 1' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Quarter 1' }),
      'Launch'
    );
    await user.click(
      screen.getByRole('combobox', {
        name: 'How much time should each report cover?',
      })
    );
    await user.click(await screen.findByRole('option', { name: 'One month' }));
    expect(
      within(
        screen.getByRole('region', { name: 'Name your reporting periods' })
      ).getAllByRole('textbox')
    ).toHaveLength(12);
    await user.click(
      screen.getByRole('combobox', {
        name: 'How much time should each report cover?',
      })
    );
    await user.click(
      await screen.findByRole('option', { name: 'Three months — a quarter' })
    );
    rerender(
      <ReportsForm
        {...props}
        financialYear={{
          ...financialYear,
          name: 'Revised FY',
          endDate: '2026-12-30',
        }}
      />
    );
    expect(
      screen.getByRole('textbox', { name: 'Reporting setup name' })
    ).toHaveValue('Board pack');
    expect(screen.getByRole('textbox', { name: 'Quarter 1' })).toHaveValue(
      'Launch'
    );
    expect(
      screen.getByRole('textbox', { name: 'Quarter 4' })
    ).toHaveAccessibleDescription('Oct 1, 2026 – Dec 30, 2026 Current');
    expect(
      screen.getByRole('region', { name: 'Financial year' })
    ).toHaveTextContent('Revised FY');
  });
  it('disables all form fields when requested', () => {
    render(<ReportsForm {...props} disabled />);
    for (const input of screen.getAllByRole('textbox'))
      expect(input).toBeDisabled();
    for (const input of screen.getAllByRole('combobox'))
      expect(input).toBeDisabled();
  });
});
