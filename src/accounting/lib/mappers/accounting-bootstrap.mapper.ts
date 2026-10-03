import type {
  ICreateExpenseAccountDto,
  ICreateRevenueAccountDto,
  ICreateStatutoryPayableAccountDto,
  ICreateStatutoryReceivableAccountDto,
  ICreateSuspenseAccountDto,
  TSupportedExpenseAccountBehavior,
  TSupportedRevenueAccountBehavior,
} from '@/shared/lib/api/Api';

function toReceivable(
  name: string,
  currencyCode: string
): ICreateStatutoryReceivableAccountDto {
  return {
    name,
    isControlAccount: false,
    currencyCode,
  };
}

function toPayable(
  name: string,
  currencyCode: string
): ICreateStatutoryPayableAccountDto {
  return {
    name,
    isControlAccount: false,
    currencyCode,
    meta: null,
  };
}

function toRevenue(
  name: string,
  behavior: TSupportedRevenueAccountBehavior
): ICreateRevenueAccountDto {
  return {
    name,
    isControlAccount: false,
    behavior,
  };
}

function toExpense(
  name: string,
  behavior: TSupportedExpenseAccountBehavior
): ICreateExpenseAccountDto {
  return {
    name,
    isControlAccount: false,
    behavior,
  };
}

function toSuspense(
  name: string,
  type: ICreateSuspenseAccountDto['type'],
  currencyCode: string
): ICreateSuspenseAccountDto {
  return { name, type, currencyCode };
}

export const accountingBootstrapMapper = Object.freeze({
  toReceivable,
  toPayable,
  toRevenue,
  toExpense,
  toSuspense,
});
