import { AccountingEntityForm } from '@/accounting/components/accounting-entity-form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const currencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
];

const jurisdictions = [
  {
    code: 'NG',
    name: 'Nigeria',
    currencyCode: 'NGN',
    maxFiscalMonths: 18,
    accountingStandards: {
      individual: [],
      sole_trader: [],
      private_company: [],
    },
  },
];

beforeAll(() => {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
describe('AccountingEntityForm', () => {
  it('shows accessible required errors without emitting invalid values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <AccountingEntityForm
          id="entity-form"
          currencies={currencies}
          jurisdictions={jurisdictions}
          onSubmit={onSubmit}
        />
        <button type="submit" form="entity-form">
          Save
        </button>
      </>
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByText('Enter a person or business name.')
    ).toBeVisible();
    expect(
      screen.getByRole('textbox', { name: 'Name' })
    ).toHaveAccessibleDescription('Enter a person or business name.');
    expect(
      screen.getByRole('combobox', { name: 'Who is this for?' })
    ).toHaveAccessibleDescription('Select who these records are for.');
    expect(
      screen.getByRole('combobox', { name: 'Country of residence' })
    ).toHaveAccessibleDescription('Select a country of residence.');
    expect(
      screen.getByRole('combobox', { name: 'Main currency for your records' })
    ).toHaveAccessibleDescription('Select the main currency for your records.');
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it('emits the selected entity details and returns to an editable state', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <>
        <AccountingEntityForm
          id="entity-form"
          currencies={currencies}
          jurisdictions={jurisdictions}
          onSubmit={onSubmit}
        />
        <button type="submit" form="entity-form">
          Save
        </button>
      </>
    );
    await user.click(
      screen.getByRole('combobox', { name: 'Who is this for?' })
    );
    await user.click(await screen.findByRole('option', { name: 'Individual' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Name' }),
      'Ada Okafor'
    );
    await user.click(
      screen.getByRole('combobox', { name: 'Country of residence' })
    );
    await user.click(await screen.findByRole('option', { name: /Nigeria/ }));
    await user.click(
      screen.getByRole('combobox', { name: 'Main currency for your records' })
    );
    await user.click(
      await screen.findByRole('option', { name: /Nigerian Naira/ })
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        entityType: 'individual',
        name: 'Ada Okafor',
        jurisdictionCode: 'NG',
        functionalCurrencyCode: 'NGN',
      })
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Name' })).toBeEnabled()
    );
  });
  it('disables every field while option data is unavailable', () => {
    render(
      <AccountingEntityForm currencies={[]} jurisdictions={[]} disabled />
    );
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeDisabled();
    for (const field of screen.getAllByRole('combobox'))
      expect(field).toBeDisabled();
  });
});
