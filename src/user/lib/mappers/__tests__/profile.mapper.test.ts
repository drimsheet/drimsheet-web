import { mapProfileFormToDto } from '@/user/lib/mappers/profile.mapper';
import { describe, expect, it } from 'vitest';

describe('mapProfileFormToDto', () => {
  it('trims names and includes only editable profile fields', () => {
    const values = {
      firstName: '  Ada  ',
      lastName: ' O’Connor-Smith ',
      email: 'ignored@example.com',
    };

    expect(mapProfileFormToDto(values)).toEqual({
      firstName: 'Ada',
      lastName: 'O’Connor-Smith',
    });
  });
});
