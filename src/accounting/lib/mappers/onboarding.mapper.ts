import type { IAccountingEntityFormValues } from '@/accounting/components/accounting-entity-form';
import type { ICategory } from '@/accounting/components/categories-form';
import type { IFinancialYearFormValues } from '@/accounting/components/financial-year-form';
import type { IReportsFormValues } from '@/accounting/components/reports-form';
import type {
  IAccountingContextCreationReq,
  IAccountingEntityCreationDto,
  IAccountingIntervalCreationReq,
  ICreateExpenseAccountDto,
  ICreateRevenueAccountDto,
  IFiscalYearCreationReq,
  IReportingContextCreationReq,
  IReportingIntervalCreationReq,
  TSupportedExpenseAccountBehavior,
  TSupportedRevenueAccountBehavior,
  UAccountingStandardCode,
} from '@/shared/lib/api/Api';

export const accountingEntityMapper = Object.freeze({
  toDto(values: IAccountingEntityFormValues): IAccountingEntityCreationDto {
    return {
      name: values.name,
      entityType:
        values.entityType as IAccountingEntityCreationDto['entityType'],
      jurisdictionCode:
        values.jurisdictionCode as IAccountingEntityCreationDto['jurisdictionCode'],
      functionalCurrencyCode:
        values.functionalCurrencyCode as IAccountingEntityCreationDto['functionalCurrencyCode'],
    };
  },
});

export const fiscalYearMapper = Object.freeze({
  toDto(
    values: IFinancialYearFormValues,
    accountingEntityId: string
  ): IFiscalYearCreationReq {
    return {
      accountingEntityId,
      name: values.name,
      startDate: `${values.startDate}T00:00:00.000Z`,
      endDate: `${values.endDate}T00:00:00.000Z`,
      status: 'open',
    };
  },
});

export const accountingIntervalMapper = Object.freeze({
  toDto(
    values: IFinancialYearFormValues,
    fiscalYearId: string
  ): IAccountingIntervalCreationReq {
    return {
      fiscalYearId,
      unit: values.unit,
      count: values.periods.length,
      periods: values.periods.map(({ name }) => ({ name })),
    };
  },
});

export const accountingContextMapper = Object.freeze({
  toDto(
    values: IFinancialYearFormValues,
    fiscalYearId: string,
    accountingIntervalId: string,
    accountingStandardCode: UAccountingStandardCode
  ): IAccountingContextCreationReq {
    return {
      fiscalYearId,
      accountingIntervalId,
      accountingStandardCode,
      name: values.name,
      description: null,
    };
  },
});

export const reportingIntervalMapper = Object.freeze({
  toDto(
    values: IReportsFormValues,
    fiscalYearId: string
  ): IReportingIntervalCreationReq {
    return {
      fiscalYearId,
      unit: values.unit,
      count: values.periods.length,
      periods: values.periods.map(({ name }) => ({ name })),
    };
  },
});

export const reportingContextMapper = Object.freeze({
  toDto(
    values: IReportsFormValues,
    accountingContextId: string,
    reportingIntervalId: string
  ): IReportingContextCreationReq {
    return {
      accountingContextId,
      reportingIntervalId,
      reportingCurrencyCode:
        values.currencyCode as IReportingContextCreationReq['reportingCurrencyCode'],
      name: values.name,
      description: null,
    };
  },
});

export const revenueAccountMapper = Object.freeze({
  toDto(
    values: ICategory,
    controlAccountId: string,
    behavior: TSupportedRevenueAccountBehavior
  ): ICreateRevenueAccountDto {
    return {
      name: values.name,
      status: 'active',
      isControlAccount: false,
      controlAccountId,
      behavior,
    };
  },
});

export const expenseAccountMapper = Object.freeze({
  toDto(
    values: ICategory,
    controlAccountId: string,
    behavior: TSupportedExpenseAccountBehavior
  ): ICreateExpenseAccountDto {
    return {
      name: values.name,
      status: 'active',
      isControlAccount: false,
      controlAccountId,
      behavior,
    };
  },
});
