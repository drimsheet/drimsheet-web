import { legalEntityMapper } from '@/accounting/lib/mappers/legal-entity.mapper';
import { expect, it } from 'vitest';

it('maps only the normalized entity name to the update DTO', () => {
  const values = { name: ' Studio Ltd  ', status: 'active' };
  expect(legalEntityMapper.toUpdateDto(values)).toEqual({ name: 'Studio Ltd' });
});
