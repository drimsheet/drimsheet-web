import { FinancialYearForm } from '@/accounting/components/financial-year-form';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('FinancialYearForm', () => {
  it('renders editable quarters and marks the current period', () => {
    render(<FinancialYearForm currentDate="2026-10-22" />);
    expect(screen.getByRole('textbox', { name: 'Quarter 1' })).toHaveValue(
      'Q1'
    );
    expect(screen.getByRole('textbox', { name: 'Quarter 4' })).toHaveValue(
      'Q4'
    );
    expect(screen.getByText('Current')).toBeVisible();
    expect(screen.getByText('4 periods')).toBeVisible();
  });
  it('updates period rows for grouping changes', async () => {
    const user = userEvent.setup();
    render(<FinancialYearForm currentDate="2026-10-22" />);
    await user.click(
      screen.getByRole('combobox', {
        name: 'How would you like to group your records?',
      })
    );
    await user.click(await screen.findByRole('option', { name: 'By month' }));

    const periods = screen.getByRole('region', {
      name: 'Name your accounting periods',
    });

    expect(within(periods).getAllByRole('textbox')).toHaveLength(12);
    expect(screen.getByRole('textbox', { name: 'Month 12' })).toHaveValue(
      'M12'
    );
  });
  it('recalculates date ranges and keeps names of unaffected periods', async () => {
    const user = userEvent.setup();
    render(<FinancialYearForm currentDate="2026-10-22" />);
    await user.clear(screen.getByRole('textbox', { name: 'Quarter 1' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Quarter 1' }),
      'Launch'
    );
    await user.click(screen.getByRole('button', { name: 'Year ends' }));
    await user.click(
      await screen.findByRole('button', { name: /December 30th, 2026/ })
    );
    expect(screen.getByRole('button', { name: 'Year ends' })).toHaveTextContent(
      '30 Dec 2026'
    );
    expect(screen.getByRole('textbox', { name: 'Quarter 1' })).toHaveValue(
      'Launch'
    );
    expect(
      screen.getByRole('textbox', { name: 'Quarter 4' })
    ).toHaveAccessibleDescription('Oct 1, 2026 – Dec 30, 2026 Current');
  });
  it('validates blank year and period names without submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <FinancialYearForm
          id="year-form"
          currentDate="2026-10-22"
          onSubmit={onSubmit}
        />
        <button type="submit" form="year-form">
          Save
        </button>
      </>
    );
    await user.clear(screen.getByRole('textbox', { name: 'Quarter 1' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByText('Enter a financial year name.')
    ).toBeVisible();
    expect(
      screen.getByRole('textbox', { name: 'Quarter 1' })
    ).toHaveAccessibleDescription(
      expect.stringContaining('Enter a name for this period.')
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('emits calculated dates and edited names after validation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <FinancialYearForm
          id="year-form"
          currentDate="2026-10-22"
          onSubmit={onSubmit}
        />
        <button type="submit" form="year-form">
          Save
        </button>
      </>
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Financial year name' }),
      'FY 2026'
    );
    await user.clear(screen.getByRole('textbox', { name: 'Quarter 1' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Quarter 1' }),
      'Launch'
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'FY 2026',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          unit: 'quarter',
          periods: expect.arrayContaining([
            { name: 'Launch', startDate: '2026-01-01', endDate: '2026-03-31' },
          ]),
        })
      )
    );
  });
  it('shows a range error and no periods for an invalid financial year', async () => {
    const user = userEvent.setup();
    render(
      <>
        <FinancialYearForm
          id="year-form"
          currentDate="2026-10-22"
          initialValues={{ startDate: '2026-06-01', endDate: '2026-01-01' }}
        />
        <button type="submit" form="year-form">
          Save
        </button>
      </>
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByText(
        'Choose an end date on or after the start date, within 18 months.'
      )
    ).toBeVisible();
    expect(
      screen.queryByRole('region', { name: 'Name your accounting periods' })
    ).not.toBeInTheDocument();
  });
});
