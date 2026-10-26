import type {
  ICreateExpenseAccountDto,
  ICreateRevenueAccountDto,
  ILedgerAccountPromotionNames,
  TSupportedExpenseAccountBehavior,
  TSupportedRevenueAccountBehavior,
} from '@/shared/lib/api/Api';
import type {
  ICategoryCreationFormValues,
  ICategoryParentSelection,
  TCategoryAccount,
} from './types';

function createInitialValues(): ICategoryCreationFormValues {
  return { type: '', parentId: '', name: '', postingAccountName: '' };
}

function findParent(
  accounts: TCategoryAccount[],
  id: string,
  path: string[] = []
): ICategoryParentSelection | null {
  for (const account of accounts) {
    const accountPath = [...path, account.name];
    if (account.id === id) {
      return { account, path: accountPath };
    }

    const descendant = findParent(account.children, id, accountPath);
    if (descendant) {
      return descendant;
    }
  }

  return null;
}

function promotionNames(
  values: ICategoryCreationFormValues,
  parent: TCategoryAccount
): ILedgerAccountPromotionNames | undefined {
  if (parent.isControlAccount) {
    return undefined;
  }

  return {
    newControlAccountName: parent.name,
    newPostingAccountName: values.postingAccountName.trim(),
  };
}

function toRevenue(
  values: ICategoryCreationFormValues,
  parent: TCategoryAccount
): ICreateRevenueAccountDto {
  return {
    name: values.name.trim(),
    isControlAccount: false,
    controlAccountId: parent.id,
    promotionNames: promotionNames(values, parent),
    // The create DTO is narrower than the COA. Preserve inheritance and let the API reject unsupported behaviors.
    behavior: parent.behavior as TSupportedRevenueAccountBehavior,
  };
}

function toExpense(
  values: ICategoryCreationFormValues,
  parent: TCategoryAccount
): ICreateExpenseAccountDto {
  return {
    name: values.name.trim(),
    isControlAccount: false,
    controlAccountId: parent.id,
    promotionNames: promotionNames(values, parent),
    // The create DTO is narrower than the COA. Preserve inheritance and let the API reject unsupported behaviors.
    behavior: parent.behavior as TSupportedExpenseAccountBehavior,
  };
}

const categoryCreationHelpers = Object.freeze({
  createInitialValues,
  findParent,
  toRevenue,
  toExpense,
});

export default categoryCreationHelpers;
