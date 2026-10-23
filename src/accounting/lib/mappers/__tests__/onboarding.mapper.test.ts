import type { IFinancialYearFormValues } from '@/accounting/components/financial-year-form';
import type { IReportsFormValues } from '@/accounting/components/reports-form';
import { onboardingCategoriesConfig } from '@/accounting/lib/configs/onboarding-categories.config';
import {
  accountingContextMapper,
  accountingEntityMapper,
  accountingIntervalMapper,
  expenseAccountMapper,
  fiscalYearMapper,
  reportingContextMapper,
  reportingIntervalMapper,
  revenueAccountMapper,
} from '@/accounting/lib/mappers/onboarding.mapper';
import { describe, expect, it } from 'vitest';

const year: IFinancialYearFormValues = {
  name: 'Trading year',
  startDate: '2026-07-01',
  endDate: '2027-06-30',
  unit: 'quarter',
  periods: [
    { name: 'Launch', startDate: '2026-07-01', endDate: '2026-09-30' },
    { name: 'Growth', startDate: '2026-10-01', endDate: '2026-12-31' },
    { name: 'Expansion', startDate: '2027-01-01', endDate: '2027-03-31' },
    { name: 'Review', startDate: '2027-04-01', endDate: '2027-06-30' },
  ],
};

const reports: IReportsFormValues = {
  name: 'Board pack',
  currencyCode: 'USD',
  unit: 'year',
  periods: [
    { name: 'Annual review', startDate: year.startDate, endDate: year.endDate },
  ],
};

describe('onboarding DTO mappers', () => {
  it('maps only the standalone legal entity fields', () => {
    expect(
      accountingEntityMapper.toDto({
        name: 'Ada',
        entityType: 'individual',
        jurisdictionCode: 'NG',
        functionalCurrencyCode: 'USD',
      })
    ).toEqual({
      name: 'Ada',
      entityType: 'individual',
      jurisdictionCode: 'NG',
      functionalCurrencyCode: 'USD',
    });
  });
  it('preserves the fiscal name and inclusive dates without timezone shifts', () => {
    expect(fiscalYearMapper.toDto(year, 'entity-id')).toEqual({
      accountingEntityId: 'entity-id',
      name: 'Trading year',
      startDate: '2026-07-01T00:00:00.000Z',
      endDate: '2027-06-30T00:00:00.000Z',
      status: 'open',
    });
  });
  it('sends ordered accounting period names and a total period count', () => {
    expect(accountingIntervalMapper.toDto(year, 'year-id')).toEqual({
      fiscalYearId: 'year-id',
      unit: 'quarter',
      count: 4,
      periods: [
        { name: 'Launch' },
        { name: 'Growth' },
        { name: 'Expansion' },
        { name: 'Review' },
      ],
    });
  });
  it('links the accounting context to its fiscal year and interval', () => {
    expect(
      accountingContextMapper.toDto(year, 'year-id', 'interval-id', 'IFRS')
    ).toEqual({
      fiscalYearId: 'year-id',
      accountingIntervalId: 'interval-id',
      accountingStandardCode: 'IFRS',
      name: 'Trading year',
      description: null,
    });
  });
  it('preserves independent reporting periods and currency', () => {
    expect(reportingIntervalMapper.toDto(reports, 'year-id')).toEqual({
      fiscalYearId: 'year-id',
      unit: 'year',
      count: 1,
      periods: [{ name: 'Annual review' }],
    });
    expect(
      reportingContextMapper.toDto(
        reports,
        'accounting-id',
        'reporting-interval-id'
      )
    ).toEqual({
      accountingContextId: 'accounting-id',
      reportingIntervalId: 'reporting-interval-id',
      reportingCurrencyCode: 'USD',
      name: 'Board pack',
      description: null,
    });
  });
  it.each(Object.entries(onboardingCategoriesConfig))(
    'maps %s to a posting account without leaking draft fields',
    (group, config) => {
      const category = {
        id: 'draft-id',
        parentId: group as keyof typeof onboardingCategoriesConfig,
        name: 'Custom category',
        selected: true,
      };

      const dto =
        config.type === 'revenue'
          ? revenueAccountMapper.toDto(category, 'parent-id', config.behavior)
          : expenseAccountMapper.toDto(category, 'parent-id', config.behavior);

      expect(dto).toEqual({
        name: 'Custom category',
        status: 'active',
        isControlAccount: false,
        controlAccountId: 'parent-id',
        behavior: config.behavior,
      });
    }
  );
});
