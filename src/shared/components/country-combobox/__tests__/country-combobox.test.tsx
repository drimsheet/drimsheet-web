import { CountryComboBox } from '@/shared/components/country-combobox';
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

describe('CountryComboBox', () => {
  it('disables selection and associates its description with its unique ID', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CountryComboBox
        id="employer-country"
        label="Employer country"
        value="NG"
        disabled
        description="Saving address changes"
        onChange={onChange}
        jurisdictions={dummyJurisdictions}
      />
    );
    const input = screen.getByRole('combobox', { name: 'Employer country' });
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('id', 'employer-country');
    expect(input).toHaveAccessibleDescription('Saving address changes');
    await user.click(input);
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('links validation errors to the input alongside its description', () => {
    render(
      <CountryComboBox
        id="vendor-country"
        label="Vendor country"
        value=""
        description="Vendor address"
        error={[{ message: 'Country is required' }]}
        onChange={vi.fn()}
        jurisdictions={dummyJurisdictions}
      />
    );
    const input = screen.getByRole('combobox', { name: 'Vendor country' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'Country is required Vendor address'
    );
  });

  it('renders correctly with no initial value', () => {
    const onChange = vi.fn();
    render(
      <CountryComboBox
        label="Country"
        value=""
        onChange={onChange}
        jurisdictions={dummyJurisdictions}
      />
    );

    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select a country')).toBeInTheDocument();
  });

  it('renders with an initial value and displays the correct flag', () => {
    const onChange = vi.fn();
    render(
      <CountryComboBox
        label="Country"
        value="NG"
        onChange={onChange}
        jurisdictions={dummyJurisdictions}
      />
    );

    // Since Nigeria flag is rendered, we can find it
    expect(screen.getByText('🇳🇬')).toBeInTheDocument();
  });

  it('opens the combobox and selects a country', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CountryComboBox
        label="Country"
        value=""
        onChange={onChange}
        jurisdictions={dummyJurisdictions}
      />
    );

    const input = screen.getByPlaceholderText('Select a country');
    await user.click(input);

    // Option should be visible
    const option = await screen.findByRole('option', { name: /Nigeria/i });
    expect(option).toBeInTheDocument();

    await user.click(option);

    expect(onChange).toHaveBeenCalledWith('NG');
  });

  it('filters countries when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CountryComboBox
        label="Country"
        value=""
        onChange={onChange}
        jurisdictions={dummyJurisdictions}
      />
    );

    const input = screen.getByPlaceholderText('Select a country');
    await user.type(input, 'cana'); // Should match Canada

    expect(
      await screen.findByRole('option', { name: /Canada/i })
    ).toBeInTheDocument();

    // Should not show non-matching options
    expect(
      screen.queryByRole('option', { name: /Nigeria/i })
    ).not.toBeInTheDocument();
  });

  it('displays an error when error prop is provided', () => {
    const onChange = vi.fn();
    render(
      <CountryComboBox
        label="Country"
        value=""
        onChange={onChange}
        error={[{ message: 'Country is required' }]}
        jurisdictions={dummyJurisdictions}
      />
    );

    expect(screen.getByText('Country is required')).toBeInTheDocument();
  });

  it('shows empty state when no countries match', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CountryComboBox
        label="Country"
        value=""
        onChange={onChange}
        jurisdictions={dummyJurisdictions}
      />
    );

    const input = screen.getByPlaceholderText('Select a country');
    await user.type(input, 'xyz123');

    expect(await screen.findByText('No countries found.')).toBeInTheDocument();
  });

  it('calls onChange with empty string when an optional selection is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CountryComboBox
        label="Country"
        value="US"
        clearable
        onChange={onChange}
        jurisdictions={dummyJurisdictions}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('handles invalid initial value gracefully', () => {
    const onChange = vi.fn();
    render(
      <CountryComboBox
        label="Country"
        value="INVALID"
        onChange={onChange}
        jurisdictions={dummyJurisdictions}
      />
    );

    // Should render the fallback GlobeIcon
    expect(screen.getByPlaceholderText('Select a country')).toBeInTheDocument();
  });
});
