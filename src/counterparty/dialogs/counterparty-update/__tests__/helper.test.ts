import helpers from '@/counterparty/dialogs/counterparty-update/helper';
import type { ICounterpartyDto } from '@/shared/lib/api/Api';
import { describe, expect, it } from 'vitest';

const id = '00000000-0000-4000-8000-000000000100';
const party = { roles: [], meta: {} } as unknown as ICounterpartyDto;
describe('counterparty update helpers', () => {
  it('uses the edit flag for prop-driven dialogs and query parameters for fallback callers', () => {
    expect(helpers.isOpen(new URLSearchParams('edit=true'), id)).toBe(true);
    expect(helpers.isOpen(new URLSearchParams(), id)).toBe(false);
    expect(
      helpers.isOpen(new URLSearchParams({ id, type: 'individual' }), id)
    ).toBe(false);
    expect(
      helpers.isOpen(new URLSearchParams({ id, type: 'individual' }))
    ).toBe(true);
    expect(helpers.isOpen(new URLSearchParams({ id, edit: 'false' }))).toBe(
      false
    );
  });
  it('validates props before query hints while preserving route identity and fallback reads', () => {
    const params = new URLSearchParams(
      'edit=true&id=invalid&type=vendor&editCounterpartyRole=invalid'
    );

    expect(
      helpers.isValidLink(params, id, {
        counterpartyId: id,
        type: 'individual',
      })
    ).toBe(true);
    expect(
      helpers.isValidLink(params, id, {
        counterpartyId: 'invalid',
        type: 'individual',
      })
    ).toBe(false);
    expect(
      helpers.isValidLink(params, 'other', {
        counterpartyId: id,
        type: 'individual',
      })
    ).toBe(false);
    expect(
      helpers.isValidLink(
        new URLSearchParams({ id, type: 'organization' }),
        undefined
      )
    ).toBe(true);
    expect(
      helpers.isValidLink(new URLSearchParams('edit=true'), undefined)
    ).toBe(false);
  });
  it('cleans redundant hints for prop-driven URLs without changing the input or reopening a closed dialog', () => {
    const record = { ...party, id, type: 'organization' as const };

    const params = new URLSearchParams(
      'edit=true&id=invalid&type=vendor&keep=preserved'
    );

    expect(helpers.normalizeParams(params, id, record).toString()).toBe(
      'edit=true&keep=preserved'
    );
    expect(params.get('id')).toBe('invalid');
    const closed = new URLSearchParams('keep=preserved');
    expect(helpers.normalizeParams(closed, id, record)).toBe(closed);
    const canonical = new URLSearchParams('edit=true&keep=preserved');
    expect(helpers.normalizeParams(canonical, id, record)).toBe(canonical);
    expect(helpers.normalizeParams(params, 'other', record)).toBe(params);
  });
  it('normalizes fallback type hints only for the fetched identity', () => {
    const record = { ...party, id, type: 'organization' as const };

    const params = new URLSearchParams({
      id,
      type: 'individual',
      editCounterpartyRole: 'contractor',
    });

    expect(helpers.normalizeParams(params, undefined, record).toString()).toBe(
      `id=${id}&type=organization`
    );
    const canonical = new URLSearchParams({ id, type: 'organization' });
    expect(helpers.normalizeParams(canonical, undefined, record)).toBe(
      canonical
    );
    const other = new URLSearchParams('id=other&type=individual');
    expect(helpers.normalizeParams(other, undefined, record)).toBe(other);
  });
  it('validates the edit identity and treats type and role as independent hints', () => {
    expect(
      helpers.isValidLink(
        new URLSearchParams({
          id,
          type: 'individual',
          editCounterpartyRole: 'vendor',
        }),
        id
      )
    ).toBe(true);
    expect(helpers.isValidLink(new URLSearchParams({ id }), id)).toBe(true);
    for (const values of [
      {},
      { id: 'invalid' },
      { id, type: 'vendor' },
      { id, editCounterpartyRole: 'organization' },
    ] as Record<string, string>[]) {
      expect(helpers.isValidLink(new URLSearchParams(values), id)).toBe(false);
    }

    expect(helpers.isValidLink(new URLSearchParams({ id }), 'other')).toBe(
      false
    );
  });
});
