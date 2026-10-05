import { BankSelection } from '@/account/components/bank-account-form/parts/bank-selection';
import type { IBankDirectoryDto } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const mockBanks: IBankDirectoryDto[] = [
  { countryCode: 'NG', bankCode: 'GTB', bankName: 'Guaranty Trust Bank' },
  { countryCode: 'NG', bankCode: 'ACCESS', bankName: 'Access Bank' },
];

const defaultProps = {
  bankLocation: 'NG',
  bankName: '',
  bankLocations: [
    { code: 'NG', name: 'Nigeria' },
    { code: 'US', name: 'United States' },
  ],
  banks: mockBanks,
  isBanksLoading: false,
  onLocationChange: vi.fn(),
  onBankNameChange: vi.fn(),
};

describe('BankSelection', () => {
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

  it('renders bank location and bank name fields', () => {
    render(<BankSelection {...defaultProps} />);

    expect(screen.getByText('Bank location')).toBeInTheDocument();
    expect(screen.getByText('Bank name')).toBeInTheDocument();
  });

  it('triggers onLocationChange when location input changes', async () => {
    const user = userEvent.setup();
    const onLocationChange = vi.fn();
    const onBankNameChange = vi.fn();

    render(
      <BankSelection
        {...defaultProps}
        onLocationChange={onLocationChange}
        onBankNameChange={onBankNameChange}
      />
    );

    const locationInput = screen.getByPlaceholderText('Select a country');
    await user.click(locationInput);

    const option = await screen.findByRole('option', {
      name: /United States/i,
    });

    await user.click(option);

    expect(onLocationChange).toHaveBeenCalledWith('US');
    expect(onBankNameChange).toHaveBeenCalledWith('');
  });

  it('triggers onBankNameChange when typing and selecting a bank', async () => {
    const user = userEvent.setup();
    const onBankNameChange = vi.fn();

    render(
      <BankSelection {...defaultProps} onBankNameChange={onBankNameChange} />
    );

    const bankInput = screen.getByRole('combobox', { name: 'Bank name' });
    await user.type(bankInput, 'Access');

    const bankOption = await screen.findByRole('option', {
      name: 'Access Bank',
    });

    await user.click(bankOption);

    expect(onBankNameChange).toHaveBeenCalledWith('Access Bank');
  });

  it('disables bank name input when loading banks', () => {
    render(<BankSelection {...defaultProps} isBanksLoading />);

    const bankNameInput = screen.getByRole('combobox', { name: 'Bank name' });
    expect(bankNameInput).toHaveAttribute('data-disabled');
    expect(bankNameInput).toHaveAttribute('placeholder', 'Loading banks...');
  });
});
