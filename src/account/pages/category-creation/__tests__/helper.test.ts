import categoryCreationHelpers from '@/account/pages/category-creation/helper';
import type {
  ICategoryCreationFormValues,
  TCategoryAccount,
} from '@/account/pages/category-creation/types';
import { describe, expect, it } from 'vitest';

const postingAccount: TCategoryAccount = {
  id: 'utilities' as TCategoryAccount['id'],
  name: 'Utilities',
  code: '5101',
  type: 'expense',
  behavior: 'rent_and_utilities',
  isControlAccount: false,
  status: 'active',
  children: [],
};

const controlAccount: TCategoryAccount = {
  ...postingAccount,
  id: 'operating' as TCategoryAccount['id'],
  name: 'Operating expenses',
  code: '5100',
  isControlAccount: true,
  children: [postingAccount],
};

const values: ICategoryCreationFormValues = {
  type: 'expense',
  name: ' Internet ',
  parentId: postingAccount.id,
  postingAccountName: ' General utilities ',
};

describe('categoryCreationHelpers', () => {
  it('starts without an implied type or parent', () => {
    expect(categoryCreationHelpers.createInitialValues()).toEqual({
      type: '',
      name: '',
      parentId: '',
      postingAccountName: '',
    });
  });
  it('finds a nested parent with its full name path', () => {
    expect(
      categoryCreationHelpers.findParent([controlAccount], postingAccount.id)
    ).toEqual({
      account: postingAccount,
      path: ['Operating expenses', 'Utilities'],
    });
    expect(
      categoryCreationHelpers.findParent([controlAccount], 'missing')
    ).toBeNull();
  });
  it('maps expense promotion and preserves the original control account name', () => {
    expect(categoryCreationHelpers.toExpense(values, postingAccount)).toEqual({
      name: 'Internet',
      isControlAccount: false,
      controlAccountId: 'utilities',
      behavior: 'rent_and_utilities',
      promotionNames: {
        newControlAccountName: 'Utilities',
        newPostingAccountName: 'General utilities',
      },
    });
  });
  it('does not rename an existing control account or send a stale clone name', () => {
    expect(categoryCreationHelpers.toExpense(values, controlAccount)).toEqual({
      name: 'Internet',
      isControlAccount: false,
      controlAccountId: 'operating',
      behavior: 'rent_and_utilities',
      promotionNames: undefined,
    });
  });
  it('inherits revenue behavior unchanged, even outside the narrow create enum', () => {
    expect(
      categoryCreationHelpers.toRevenue(
        { ...values, type: 'revenue', name: ' Online sales ' },
        { ...postingAccount, type: 'revenue', behavior: 'sales', name: 'Sales' }
      )
    ).toEqual({
      name: 'Online sales',
      isControlAccount: false,
      controlAccountId: 'utilities',
      behavior: 'sales',
      promotionNames: {
        newControlAccountName: 'Sales',
        newPostingAccountName: 'General utilities',
      },
    });
  });
  it('inherits unsupported expense behavior without substituting a default', () => {
    expect(
      categoryCreationHelpers.toExpense(values, {
        ...controlAccount,
        behavior: 'admin_and_general',
      })
    ).toEqual({
      name: 'Internet',
      isControlAccount: false,
      controlAccountId: 'operating',
      behavior: 'admin_and_general',
      promotionNames: undefined,
    });
  });
});
