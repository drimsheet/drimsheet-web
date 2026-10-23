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
    await user.clear(
      screen.getByRole('textbox', { name: 'Financial year name' })
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
    await user.clear(
      screen.getByRole('textbox', { name: 'Financial year name' })
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
        'Choose an end date on or after the start date, within 23 months.'
      )
    ).toBeVisible();
    expect(
      screen.queryByRole('region', { name: 'Name your accounting periods' })
    ).not.toBeInTheDocument();
  });
});

it('defaults the financial year name using the supplied current year', () => {
  render(<FinancialYearForm currentDate="2027-02-01" />);
  expect(
    screen.getByRole('textbox', { name: 'Financial year name' })
  ).toHaveValue('2027 Financial Year');
});

it('disables end dates before the start and start dates after the end', async () => {
  const user = userEvent.setup();
  render(
    <FinancialYearForm
      currentDate="2026-10-22"
      initialValues={{ startDate: '2026-04-10', endDate: '2026-04-20' }}
    />
  );
  await user.click(screen.getByRole('button', { name: 'Year ends' }));
  expect(
    screen.getByRole('button', { name: /April 9th, 2026/ })
  ).toBeDisabled();
  expect(
    screen.getByRole('button', { name: /April 10th, 2026/ })
  ).toBeEnabled();
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: 'Year starts' }));
  expect(
    screen.getByRole('button', { name: /April 21st, 2026/ })
  ).toBeDisabled();
  expect(
    screen.getByRole('button', { name: /April 20th, 2026/ })
  ).toBeEnabled();
});

it.each([23, 24])(
  'rejects a financial year longer than 23 months even with a configured limit of %s',
  async (maxFiscalMonths) => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <FinancialYearForm
          id="long-year"
          currentDate="2026-10-22"
          maxFiscalMonths={maxFiscalMonths}
          initialValues={{ startDate: '2026-01-01', endDate: '2027-12-02' }}
          onSubmit={onSubmit}
        />
        <button form="long-year" type="submit">
          Continue
        </button>
      </>
    );
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(
      await screen.findByText(
        'Choose an end date on or after the start date, within 23 months.'
      )
    ).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  }
);

it('accepts a financial year with dates exactly 23 calendar months apart', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(
    <>
      <FinancialYearForm
        id="long-year"
        currentDate="2026-10-22"
        initialValues={{
          startDate: '2026-01-01',
          endDate: '2027-12-01',
          unit: 'year',
        }}
        onSubmit={onSubmit}
      />
      <button form="long-year" type="submit">
        Continue
      </button>
    </>
  );
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2026-01-01',
        endDate: '2027-12-01',
        name: '2026 Financial Year',
      })
    )
  );
});

it('prefills the jurisdiction dates and shows a warning when either date changes', async () => {
  const user = userEvent.setup();
  render(<FinancialYearForm currentDate="2026-10-23" jurisdictionCode="AU" />);
  expect(screen.getByRole('button', { name: 'Year starts' })).toHaveTextContent(
    '1 Jul 2026'
  );
  expect(screen.getByRole('button', { name: 'Year ends' })).toHaveTextContent(
    '30 Jun 2027'
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Year starts' }));
  await user.click(screen.getByRole('button', { name: /July 2nd, 2026/ }));
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Your selected dates differ from this jurisdiction’s official financial year: Jul 1, 2026 to Jun 30, 2027. You can still continue.'
  );
  expect(screen.getByRole('alert')).toHaveClass('text-warning');
  await user.click(screen.getByRole('button', { name: 'Year starts' }));
  await user.click(screen.getByRole('button', { name: /July 1st, 2026/ }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Year ends' }));
  await user.click(screen.getByRole('button', { name: /June 29th, 2027/ }));
  expect(screen.getByRole('alert')).toHaveClass('text-warning');
});
