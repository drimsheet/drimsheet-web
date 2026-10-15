import type { TCategoryAccount } from '@/account/pages/category-creation/types';
import { categoryCreationSchema } from '@/account/pages/category-creation/validation';
import i18next from 'i18next';
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

const values = {
  type: 'expense',
  parentId: 'utilities',
  name: 'Internet',
  postingAccountName: 'General utilities',
};

const t = i18next.getFixedT(null, 'ledger-accounts');

describe('categoryCreationSchema', () => {
  it('requires a type and a real selected parent', async () => {
    const schema = categoryCreationSchema(t, null);
    expect(await schema.isValid({ ...values, type: '', parentId: '' })).toBe(
      false
    );
    expect(await schema.isValid(values)).toBe(false);
  });
  it('rejects a parent from a different class', async () => {
    const schema = categoryCreationSchema(t, {
      account: postingAccount,
      path: ['Utilities'],
    });

    expect(await schema.isValid({ ...values, type: 'revenue' })).toBe(false);
  });
  it('requires a distinct nonblank clone name only when promoting', async () => {
    const schema = categoryCreationSchema(t, {
      account: postingAccount,
      path: ['Utilities'],
    });

    expect(await schema.isValid({ ...values, postingAccountName: '  ' })).toBe(
      false
    );
    expect(
      await schema.isValid({ ...values, postingAccountName: ' UTILITIES ' })
    ).toBe(false);
    expect(await schema.isValid(values)).toBe(true);
    expect(await schema.isValid({ ...values, name: ' ' })).toBe(false);
  });
  it('allows creation under an existing control account without a clone name', async () => {
    const schema = categoryCreationSchema(t, {
      account: controlAccount,
      path: ['Operating expenses'],
    });

    expect(
      await schema.isValid({
        ...values,
        parentId: controlAccount.id,
        postingAccountName: '',
      })
    ).toBe(true);
  });
});
