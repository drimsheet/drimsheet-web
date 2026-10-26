import { AccountingEntityForm } from '@/accounting/components/accounting-entity-form';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const currencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', minorUnit: 2 },
  { code: 'USD', name: 'US Dollar', symbol: '$', minorUnit: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', minorUnit: 2 },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£', minorUnit: 2 },
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
      screen.getByRole('radiogroup', { name: 'Who is this for?' })
    ).toHaveAccessibleDescription('Select who these records are for.');
    expect(
      screen.getByRole('combobox', { name: 'Country of residence' })
    ).toHaveAccessibleDescription('Select a country of residence.');
    expect(
      screen.getByRole('combobox', { name: 'Official currency' })
    ).toHaveAccessibleDescription('Select an official currency.');
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
    await user.click(await screen.findByRole('radio', { name: 'Individual' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Name' }),
      'Ada Okafor'
    );
    await user.click(
      screen.getByRole('combobox', { name: 'Country of residence' })
    );
    await user.click(await screen.findByRole('option', { name: /Nigeria/ }));
    await user.click(
      screen.getByRole('combobox', { name: 'Official currency' })
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
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }

    for (const field of screen.getAllByRole('combobox')) {
      expect(field).toBeDisabled();
    }
  });

  it('selects cards through their descriptions and changes the exclusive choice with the keyboard', async () => {
    const user = userEvent.setup();
    render(
      <AccountingEntityForm
        currencies={currencies}
        jurisdictions={jurisdictions}
      />
    );
    const individual = screen.getByRole('radio', { name: 'Individual' });
    const soleTrader = screen.getByRole('radio', { name: 'Sole trader' });
    const company = screen.getByRole('radio', { name: 'Private company' });

    expect(individual).not.toBeChecked();
    expect(soleTrader).not.toBeChecked();
    expect(company).not.toBeChecked();
    expect(individual).toHaveAccessibleDescription('Your personal finances.');
    await user.click(screen.getByText('Business as an individual.'));
    expect(soleTrader).toBeChecked();
    expect(soleTrader).toHaveFocus();
    await user.keyboard('{ArrowRight>}');
    await waitFor(() => expect(company).toBeChecked());
    await user.keyboard('{/ArrowRight}');
    expect(company).toHaveFocus();
    expect(soleTrader).not.toBeChecked();
    await user.keyboard('{ArrowRight>}');
    await waitFor(() => expect(individual).toBeChecked());
    await user.keyboard('{/ArrowRight}');
    expect(company).not.toBeChecked();
  });
});

it('prefills the individual name from the profile and lets the user edit it', async () => {
  const user = userEvent.setup();
  render(
    <AccountingEntityForm
      currencies={currencies}
      jurisdictions={jurisdictions}
      individualName="Ada Okafor"
    />
  );
  await user.click(screen.getByRole('radio', { name: 'Individual' }));
  const name = screen.getByRole('textbox', { name: 'Name' });
  expect(name).toHaveValue('Ada Okafor');
  await user.clear(name);
  await user.type(name, 'Ada Personal');
  expect(name).toHaveValue('Ada Personal');
});

it.each(['Sole trader', 'Private company'])(
  'does not prefill a profile name for %s',
  async (entityType) => {
    const user = userEvent.setup();
    render(
      <AccountingEntityForm
        currencies={currencies}
        jurisdictions={jurisdictions}
        individualName="Ada Okafor"
      />
    );
    await user.click(screen.getByRole('radio', { name: entityType }));
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
  }
);

it('sets the official currency when a country is selected', async () => {
  const user = userEvent.setup();
  render(
    <AccountingEntityForm
      currencies={currencies}
      jurisdictions={jurisdictions}
      initialValues={{ functionalCurrencyCode: 'EUR' }}
    />
  );
  await user.click(
    screen.getByRole('combobox', { name: 'Country of residence' })
  );
  await user.click(screen.getByRole('option', { name: /Nigeria/ }));
  expect(
    screen.getByRole('combobox', { name: 'Official currency' })
  ).toHaveValue('Nigerian Naira');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('infers the country when the currency has exactly one matching country', async () => {
  const user = userEvent.setup();
  render(
    <AccountingEntityForm
      currencies={currencies}
      jurisdictions={jurisdictions}
    />
  );
  await user.click(screen.getByRole('combobox', { name: 'Official currency' }));
  await user.click(screen.getByRole('option', { name: /Nigerian Naira/ }));
  expect(
    screen.getByRole('combobox', { name: 'Country of residence' })
  ).toHaveValue('Nigeria');
});

it.each(['Euro', 'Pound Sterling'])(
  'leaves the country empty when %s has no unique country match',
  async (currency) => {
    const user = userEvent.setup();
    render(
      <AccountingEntityForm
        currencies={currencies}
        jurisdictions={[
          ...jurisdictions,
          {
            ...jurisdictions[0],
            code: 'DE',
            name: 'Germany',
            currencyCode: 'EUR',
          },
          {
            ...jurisdictions[0],
            code: 'FR',
            name: 'France',
            currencyCode: 'EUR',
          },
        ]}
      />
    );
    await user.click(
      screen.getByRole('combobox', { name: 'Official currency' })
    );
    await user.click(
      screen.getByRole('option', { name: new RegExp(currency) })
    );
    expect(
      screen.getByRole('combobox', { name: 'Country of residence' })
    ).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  }
);

it('warns about a mismatched currency without changing the country or blocking submission', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(
    <>
      <AccountingEntityForm
        id="mismatch-form"
        currencies={currencies}
        jurisdictions={[
          ...jurisdictions,
          {
            ...jurisdictions[0],
            code: 'US',
            name: 'United States',
            currencyCode: 'USD',
          },
        ]}
        initialValues={{
          entityType: 'individual',
          name: 'Ada Okafor',
          jurisdictionCode: 'NG',
          functionalCurrencyCode: 'NGN',
        }}
        onSubmit={onSubmit}
      />
      <button type="submit" form="mismatch-form">
        Continue
      </button>
    </>
  );
  const currency = screen.getByRole('combobox', { name: 'Official currency' });
  await user.clear(currency);
  await user.type(currency, 'US Dollar');
  await user.click(screen.getByRole('option', { name: /US Dollar/ }));
  expect(
    screen.getByRole('combobox', { name: 'Country of residence' })
  ).toHaveValue('Nigeria');
  expect(screen.getByRole('alert')).toHaveTextContent(
    'The selected currency does not match the official currency of Nigeria (NGN). You can still continue.'
  );
  expect(screen.getByRole('alert')).toHaveClass('text-destructive');
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith({
      entityType: 'individual',
      name: 'Ada Okafor',
      jurisdictionCode: 'NG',
      functionalCurrencyCode: 'USD',
    })
  );
  await user.clear(currency);
  await user.type(currency, 'Nigerian Naira');
  await user.click(screen.getByRole('option', { name: /Nigerian Naira/ }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
