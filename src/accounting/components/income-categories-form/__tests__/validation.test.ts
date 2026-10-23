import { incomeCategorySchema } from '@/accounting/components/income-categories-form/validation';
import i18n from 'i18next';
import { describe, expect, it } from 'vitest';

const schema = incomeCategorySchema(
  i18n.getFixedT('en', 'accounting'),
  [
    { id: 'services', name: 'Services' },
    { id: 'gifts', name: 'Gifts' },
  ],
  [
    {
      id: 'consulting',
      parentId: 'services',
      name: 'Consulting',
      selected: false,
    },
  ]
);

describe('incomeCategorySchema', () => {
  it('requires a valid parent and a nonblank name', async () => {
    await expect(
      schema.validate({ parentId: 'unknown', name: 'Sales' })
    ).rejects.toThrow('Select a parent account.');
    await expect(
      schema.validate({ parentId: 'services', name: '  ' })
    ).rejects.toThrow('Enter a category name.');
  });
  it('rejects case-insensitive sibling duplicates even when deselected', async () => {
    await expect(
      schema.validate({ parentId: 'services', name: '  CONSULTING  ' })
    ).rejects.toThrow(
      'A category with this name already exists under this parent.'
    );
    await expect(
      schema.validate({ parentId: 'gifts', name: 'Consulting' })
    ).resolves.toEqual({ parentId: 'gifts', name: 'Consulting' });
  });
});
