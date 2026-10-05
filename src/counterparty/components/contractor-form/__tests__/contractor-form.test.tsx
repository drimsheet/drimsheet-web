import { ContractorForm } from '@/counterparty/components/contractor-form';
import uiCountries from '@/shared/configs/countries.json' with { type: 'json' };
import type {
  IAccountingStandardDto,
  IJurisdictionDto,
} from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const dummyJurisdictions: IJurisdictionDto[] = uiCountries.map((c) => ({
  code: c.code,
  name: c.name,
  currencyCode: c.currencyCode,
  maxFiscalMonths: 12,
  accountingStandards: {} as IAccountingStandardDto,
}));

describe('ContractorForm', () => {
  it('renders required address header and field labels without optional tags for mandatory fields', () => {
    render(
      <ContractorForm onSubmit={vi.fn()} jurisdictions={dummyJurisdictions} />
    );

    expect(screen.getByLabelText(/Legal name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Display name \(Optional\)/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
  });

  it('validates address, city, and country on submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ContractorForm onSubmit={onSubmit} jurisdictions={dummyJurisdictions} />
    );

    const nameInput = screen.getByLabelText(/Legal name/i);
    await user.type(nameInput, 'Grand Union Co.');

    const createBtn = screen.getByRole('button', { name: /Create/i });
    await user.click(createBtn);

    // Validation messages should appear
    expect(await screen.findByText('Address is required')).toBeInTheDocument();
    expect(await screen.findByText('City is required')).toBeInTheDocument();
    expect(await screen.findByText('Country is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits successfully when all mandatory fields are provided', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ContractorForm onSubmit={onSubmit} jurisdictions={dummyJurisdictions} />
    );

    const nameInput = screen.getByLabelText(/Legal name/i);
    await user.type(nameInput, 'Jane Doe');

    const displayNameInput = screen.getByLabelText(
      /Display name \(Optional\)/i
    );

    await user.type(displayNameInput, 'JD Contractor');

    const addressInput = screen.getByLabelText('Address');
    await user.type(addressInput, '10 Green Way');

    const cityInput = screen.getByLabelText('City');
    await user.type(cityInput, 'Yaba');

    // Select country
    const countryInput = screen.getByPlaceholderText('Select a country');
    await user.click(countryInput);
    const option = await screen.findByRole('option', { name: /Nigeria/i });
    await user.click(option);

    const createBtn = screen.getByRole('button', { name: /Create/i });
    await user.click(createBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Jane Doe',
      type: 'individual',
      displayName: 'JD Contractor',
      address: {
        line1: '10 Green Way',
        line2: '',
        city: 'Yaba',
        region: '',
        countryCode: 'NG',
      },
    });
  });
});

it('supports update actions and preserves the locked type when submitting other edits', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(
    <ContractorForm
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitLabel="Save changes"
      showPostalCode
      showDisplayName={false}
      typeRestriction={{
        value: 'organization',
        description: 'Already used in a transaction.',
      }}
      initialValues={{
        name: 'Original',
        type: 'individual',
        displayName: 'Display',
        address: {
          line1: 'Street',
          city: 'Lagos',
          countryCode: 'NG',
          postalCode: '100001',
        },
      }}
    />
  );
  expect(screen.getByRole('combobox', { name: 'Type' })).toBeDisabled();
  expect(
    screen.getByRole('combobox', { name: 'Type' })
  ).toHaveAccessibleDescription('Already used in a transaction.');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Original', type: 'organization' })
  );
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onCancel).toHaveBeenCalledOnce();
});
