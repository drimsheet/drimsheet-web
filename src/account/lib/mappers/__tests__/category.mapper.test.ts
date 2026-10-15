import { categoryMapper } from '@/account/lib/mappers/category.mapper';
import { describe, expect, it } from 'vitest';

describe('categoryMapper', () => {
  it('only sends the editable name on update', () => {
    expect(
      categoryMapper.toUpdate({
        name: ' Renamed ',
      })
    ).toEqual({ name: 'Renamed' });
  });
});
