import {
  AccountingEntityCreationForm,
  AccountingEntityCreationFormSkeleton,
} from '@/accounting/components/accounting-entity-creation-form';
import { createAccountingEntityCreationFormValidation } from '@/accounting/components/accounting-entity-creation-form/validation';
import {
  EAccountingEntityType,
  type IJurisdictionDto,
} from '@/shared/lib/api/Api';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const jurisdictions: IJurisdictionDto[] = [
  {
    code: 'NG',
    name: 'Nigeria',
    currencyCode: 'NGN',
    maxFiscalMonths: 12,
    accountingStandards: {
      [EAccountingEntityType.Individual]: ['IFRS'],
      [EAccountingEntityType.SoleTrader]: ['IFRS'],
      [EAccountingEntityType.PrivateCompany]: ['IFRS'],
    },
  },
  {
    code: 'US',
    name: 'United States',
    currencyCode: 'USD',
    maxFiscalMonths: 18,
    accountingStandards: {
      [EAccountingEntityType.Individual]: ['GAAP'],
      [EAccountingEntityType.SoleTrader]: ['GAAP'],
      [EAccountingEntityType.PrivateCompany]: ['GAAP'],
    },
  },
];

const validationMessages = {
  nameRequired: 'Name is required',
  entityTypeRequired: 'Entity type is required',
  countryRequired: 'Country is required',
  functionalCurrencyRequired: 'Functional currency is required',
  reportingCurrencyRequired: 'Reporting currency is required',
  fiscalYearStartRequired: 'Fiscal year start is required',
  fiscalYearEndRequired: 'Fiscal year end is required',
  fiscalYearStartTooOld:
    'Start date must not be less than two years from the current date',
  fiscalYearMinDuration: 'The accounting period must be at least one month.',
  getFiscalYearMaxDuration: (maxFiscalMonths: number, country: string) =>
    `The accounting period cannot exceed the ${maxFiscalMonths}-month limit for ${country}.`,
};

const validationSchema = createAccountingEntityCreationFormValidation(
  jurisdictions,
  validationMessages
);

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
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

describe('AccountingEntityCreationForm', () => {
  const setup = () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <AccountingEntityCreationForm
        onSubmit={onSubmit}
        individualName="Ada Lovelace"
      />
    );

    return { onSubmit, user };
  };

  it('renders step 1 by default', () => {
    setup();

    expect(screen.getByText('Where do you reside?')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Who is this account for?' })
    ).toHaveTextContent('Select an entity');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  it("populates the user's name when an individual is selected", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole('combobox', { name: 'Who is this account for?' })
    );
    await user.click(screen.getByRole('option', { name: 'An Individual' }));

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
      'Ada Lovelace'
    );
  });

  it('can select a company, navigate through the steps, and submit it', async () => {
    const { onSubmit, user } = setup();

    // Step 1
    await user.click(
      screen.getByRole('combobox', { name: 'Who is this account for?' })
    );
    await user.click(screen.getByRole('option', { name: 'A Company' }));
    const nameInput = screen.getByRole('textbox', { name: 'Name' });
    expect(nameInput).toHaveValue('');
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
    await user.type(nameInput, 'Drimsheet');

    const nextBtn1 = screen.getByRole('button', { name: /Next/i });
    expect(nextBtn1).toBeEnabled();
    await user.click(nextBtn1);

    // Step 2
    expect(
      screen.getByText('What currency should your reports use?')
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 3');
    const nextBtn2 = screen.getByRole('button', { name: /Next/i });
    await user.click(nextBtn2);

    // Step 3
    const submitBtn = screen.getByRole('button', { name: /Complete setup/i });
    expect(submitBtn).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Step 3 of 3');

    // Submit
    await user.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Drimsheet',
      entityType: EAccountingEntityType.PrivateCompany,
      countryCode: 'NG',
      functionalCurrency: 'NGN',
      reportingCurrency: 'NGN',
      fiscalYearStart: expect.any(Date),
      fiscalYearEnd: expect.any(Date),
      appUsageMode: 'non_power_user',
      accountingStandardCode: 'IFRS',
    });
  });

  it('can navigate back to previous steps', async () => {
    const { user } = setup();

    // Go to step 2
    await user.click(
      screen.getByRole('combobox', { name: 'Who is this account for?' })
    );
    await user.click(screen.getByRole('option', { name: 'An Individual' }));
    await user.click(screen.getByRole('button', { name: /Next/i }));
    expect(
      screen.getByText('What currency should your reports use?')
    ).toBeInTheDocument();

    // Go back to step 1
    await user.click(screen.getByRole('button', { name: /Back/i }));

    // Verify Step 1 is shown
    expect(screen.getByText('Where do you reside?')).toBeInTheDocument();
    expect(
      screen.queryByText('What currency should your reports use?')
    ).not.toBeInTheDocument();
  });

  it('renders loading state on the submit button when loading prop is true', async () => {
    render(
      <AccountingEntityCreationForm
        onSubmit={vi.fn()}
        individualName="Ada Lovelace"
        loading={true}
      />
    );
    const user = userEvent.setup();

    // Navigate to step 3
    await user.click(
      screen.getByRole('combobox', { name: 'Who is this account for?' })
    );
    await user.click(screen.getByRole('option', { name: 'An Individual' }));
    await user.click(screen.getByRole('button', { name: /Next/i }));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Usually "loading" on Button adds a spinner or something, or disables it.
    // The button might still have the text or might be disabled. Let's just check if it's there.
    const submitBtn = screen.getByRole('button', { name: /Complete setup/i });
    // Assuming loading button is disabled
    expect(submitBtn).toBeDisabled();
  });

  it('displays the jurisdiction fiscal-month limit and blocks progression', async () => {
    const limitedJurisdiction: IJurisdictionDto = {
      ...jurisdictions[0],
      maxFiscalMonths: 11,
    };

    render(
      <AccountingEntityCreationForm
        onSubmit={vi.fn()}
        individualName="Ada Lovelace"
        jurisdictions={[limitedJurisdiction]}
      />
    );
    const user = userEvent.setup();

    await user.click(
      screen.getByRole('combobox', { name: 'Who is this account for?' })
    );
    await user.click(screen.getByRole('option', { name: 'An Individual' }));
    await user.click(screen.getByRole('button', { name: /Next/i }));

    const nextButton = screen.getByRole('button', { name: /Next/i });

    const fiscalYearEnd = dayjs()
      .startOf('year')
      .add(1, 'year')
      .subtract(1, 'day')
      .toDate();

    const endDateButtonName = new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
      .format(fiscalYearEnd)
      .replace(/,/g, '');

    await user.click(screen.getByRole('button', { name: endDateButtonName }));
    await user.click(screen.getByRole('button', { name: /December 30th/i }));

    expect(
      await screen.findByText(
        'The accounting period cannot exceed the 11-month limit for Nigeria.'
      )
    ).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    const invalidEndDateButtonName = new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
      .format(dayjs(fiscalYearEnd).subtract(1, 'day').toDate())
      .replace(/,/g, '');

    await user.click(
      screen.getByRole('button', { name: invalidEndDateButtonName })
    );
    await user.click(screen.getByRole('button', { name: /November 30th/i }));

    await waitFor(() => {
      expect(
        screen.queryByText(
          'The accounting period cannot exceed the 11-month limit for Nigeria.'
        )
      ).not.toBeInTheDocument();
      expect(nextButton).toBeEnabled();
    });
  });
});

describe('AccountingEntityCreationFormSkeleton', () => {
  it('announces that the profile is loading', () => {
    render(<AccountingEntityCreationFormSkeleton />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading your profile…'
    );
  });
});

describe('AccountingEntityCreationForm Validation', () => {
  it('requires an entity name', async () => {
    const fiscalYearStart = dayjs().startOf('year');

    await expect(
      validationSchema.validate({
        name: ' ',
        entityType: 'private_company',
        countryCode: 'NG',
        functionalCurrency: 'NGN',
        reportingCurrency: 'NGN',
        fiscalYearStart: fiscalYearStart.toDate(),
        fiscalYearEnd: fiscalYearStart
          .add(12, 'months')
          .subtract(1, 'day')
          .toDate(),
      })
    ).rejects.toThrow('Name is required');
  });

  it('validates that fiscalYearStart is not more than 2 years in the past', async () => {
    const fiscalYearStart = dayjs().subtract(1, 'year');

    const validData = {
      name: 'Ada Lovelace',
      entityType: 'individual',
      countryCode: 'NG',
      functionalCurrency: 'NGN',
      reportingCurrency: 'NGN',
      fiscalYearStart: fiscalYearStart.toDate(),
      fiscalYearEnd: fiscalYearStart
        .add(12, 'months')
        .subtract(1, 'day')
        .toDate(),
    };

    await expect(validationSchema.validate(validData)).resolves.toBeTruthy();

    const invalidFiscalYearStart = dayjs().subtract(3, 'years');

    const invalidData = {
      ...validData,
      fiscalYearStart: invalidFiscalYearStart.toDate(),
      fiscalYearEnd: invalidFiscalYearStart
        .add(12, 'months')
        .subtract(1, 'day')
        .toDate(),
    };

    await expect(validationSchema.validate(invalidData)).rejects.toThrow(
      'Start date must not be less than two years from the current date'
    );
  });

  it('uses the selected jurisdiction maximum as an inclusive boundary', async () => {
    const fiscalYearStart = dayjs().startOf('year');

    const validData = {
      name: 'Ada Lovelace',
      entityType: 'individual',
      countryCode: 'NG',
      functionalCurrency: 'NGN',
      reportingCurrency: 'NGN',
      fiscalYearStart: fiscalYearStart.toDate(),
      fiscalYearEnd: fiscalYearStart
        .add(12, 'months')
        .subtract(1, 'day')
        .toDate(),
    };

    await expect(validationSchema.validate(validData)).resolves.toBeTruthy();

    await expect(
      validationSchema.validate({
        ...validData,
        fiscalYearEnd: fiscalYearStart.add(12, 'months').toDate(),
      })
    ).rejects.toThrow(
      'The accounting period cannot exceed the 12-month limit for Nigeria.'
    );
  });

  it('requires the accounting period to span at least one month', async () => {
    const fiscalYearStart = dayjs().startOf('year');

    await expect(
      validationSchema.validate({
        name: 'Ada Lovelace',
        entityType: 'individual',
        countryCode: 'NG',
        functionalCurrency: 'NGN',
        reportingCurrency: 'NGN',
        fiscalYearStart: fiscalYearStart.toDate(),
        fiscalYearEnd: fiscalYearStart
          .add(1, 'month')
          .subtract(2, 'days')
          .toDate(),
      })
    ).rejects.toThrow('The accounting period must be at least one month.');
  });

  it('uses the maximum belonging to the selected country', async () => {
    const fiscalYearStart = dayjs().startOf('year');

    const data = {
      name: 'Ada Lovelace',
      entityType: 'individual',
      countryCode: 'US',
      functionalCurrency: 'USD',
      reportingCurrency: 'USD',
      fiscalYearStart: fiscalYearStart.toDate(),
      fiscalYearEnd: fiscalYearStart
        .add(18, 'months')
        .subtract(1, 'day')
        .toDate(),
    };

    await expect(validationSchema.validate(data)).resolves.toBeTruthy();

    await expect(
      validationSchema.validate({
        ...data,
        fiscalYearEnd: fiscalYearStart.add(18, 'months').toDate(),
      })
    ).rejects.toThrow(
      'The accounting period cannot exceed the 18-month limit for United States.'
    );
  });
});
