import incomeCategoriesFormHelpers from '@/accounting/components/income-categories-form/helper';
import i18n from 'i18next';
import { describe, expect, it } from 'vitest';

describe('incomeCategoriesFormHelpers', () => {
  it('creates the four translated parent groups and selected defaults', () => {
    const groups = incomeCategoriesFormHelpers.createGroups(
      i18n.getFixedT('en', 'accounting')
    );

    expect(groups.map(({ name }) => name)).toEqual([
      'Services',
      'Employment income',
      'Grants',
      'Gifts',
    ]);

    const values = incomeCategoriesFormHelpers.createInitialValues(
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
      incomeCategoriesFormHelpers.createInitialValues([], String, values)
    ).toEqual(values);
  });
});
