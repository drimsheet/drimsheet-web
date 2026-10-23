import categoriesFormHelpers from '@/accounting/components/categories-form/helper';
import i18n from 'i18next';
import { describe, expect, it } from 'vitest';

describe('categoriesFormHelpers', () => {
  it('creates expense defaults under the four expense parent groups', () => {
    const groups = categoriesFormHelpers.createGroups(
      i18n.getFixedT('en', 'accounting'),
      'expense'
    );

    expect(groups.map(({ name }) => name)).toEqual([
      'Direct costs',
      'Rent and utilities',
      'Bank charges',
      'Interest',
    ]);

    const values = categoriesFormHelpers.createInitialValues(
      groups,
      (name) => `${name} (Default)`
    );

    expect(values.categories.map(({ parentId }) => parentId)).toEqual([
      'direct_costs',
      'rent_utilities',
      'bank_charges',
      'interest',
    ]);
    expect(values.categories.every(({ selected }) => selected)).toBe(true);
  });
  it('creates the four translated parent groups and selected defaults', () => {
    const groups = categoriesFormHelpers.createGroups(
      i18n.getFixedT('en', 'accounting'),
      'income'
    );

    expect(groups.map(({ name }) => name)).toEqual([
      'Services',
      'Employment income',
      'Grants',
      'Gifts',
    ]);

    const values = categoriesFormHelpers.createInitialValues(
      groups,
      (name) => `${name} (Default)`
    );

    expect(values.categories).toHaveLength(4);
    expect(values.categories[0]).toEqual({
      id: 'services-default',
      parentId: 'services',
      name: 'Services (Default)',
      selected: true,
    });
    expect(new Set(values.categories.map(({ id }) => id)).size).toBe(4);
  });
  it('preserves supplied custom categories and selections', () => {
    const values = {
      categories: [
        {
          id: 'custom',
          parentId: 'services' as const,
          name: 'Consulting',
          selected: false,
        },
      ],
    };

    expect(
      categoriesFormHelpers.createInitialValues([], String, values)
    ).toEqual(values);
  });
});
