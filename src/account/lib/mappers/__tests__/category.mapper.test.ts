import { categoryMapper } from '@/account/lib/mappers/category.mapper';
import { describe, expect, it } from 'vitest';

describe('categoryMapper', () => {
  it('maps a revenue form to the posting-account DTO without leaking UI fields', () => {
    expect(
      categoryMapper.toRevenue({
        name: ' Consulting ',
        type: 'revenue',
        behavior: 'services',
      })
    ).toEqual({
      name: 'Consulting',
      isControlAccount: false,
      behavior: 'services',
    });
  });
  it('maps an expense form to the posting-account DTO', () => {
    expect(
      categoryMapper.toExpense({
        name: ' Rent ',
        type: 'expense',
        behavior: 'rent_and_utilities',
      })
    ).toEqual({
      name: 'Rent',
      isControlAccount: false,
      behavior: 'rent_and_utilities',
    });
  });
  it('only sends the editable name on update', () => {
    expect(
      categoryMapper.toUpdate({
        name: ' Renamed ',
        type: 'expense',
        behavior: 'interest',
      })
    ).toEqual({ name: 'Renamed' });
  });
});
