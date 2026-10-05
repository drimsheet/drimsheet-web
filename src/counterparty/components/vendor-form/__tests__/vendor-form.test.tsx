import { VendorForm } from '@/counterparty/components/vendor-form';
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

describe('VendorForm', () => {
  it('renders all form fields, labels and placeholders', () => {
    render(
      <VendorForm onSubmit={vi.fn()} jurisdictions={dummyJurisdictions} />
    );

    expect(screen.getByLabelText(/Legal name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Display name')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Address line 2')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('State')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
  });

  it('submits successfully with only required fields (legal name and type)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <VendorForm onSubmit={onSubmit} jurisdictions={dummyJurisdictions} />
    );

    const nameInput = screen.getByLabelText(/Legal name/i);
    await user.type(nameInput, 'Grand Union Co.');

    const createBtn = screen.getByRole('button', { name: /Create/i });
    await user.click(createBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Grand Union Co.',
      type: 'individual',
      displayName: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        region: '',
        countryCode: '',
      },
    });
  });

  it('requires address line 1, city, and country if any address field is partially filled', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <VendorForm onSubmit={onSubmit} jurisdictions={dummyJurisdictions} />
    );

    const nameInput = screen.getByLabelText(/Legal name/i);
    await user.type(nameInput, 'Grand Union Co.');

    // Partially fill address line 2
    const line2Input = screen.getByLabelText('Address line 2');
    await user.type(line2Input, 'Suite 404');

    const createBtn = screen.getByRole('button', { name: /Create/i });
    await user.click(createBtn);

    // Validation messages should appear
    expect(await screen.findByText('Address is required')).toBeInTheDocument();
    expect(await screen.findByText('City is required')).toBeInTheDocument();
    expect(await screen.findByText('Country is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

it('supports update actions and preserves the locked type when submitting other edits', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(
    <VendorForm
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
