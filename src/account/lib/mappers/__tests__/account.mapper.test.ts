import { ledgerAccountMapper } from '@/account/lib/mappers/account.mapper';
import { describe, expect, it } from 'vitest';

describe('ledgerAccountMapper', () => {
  it.each([
    ['draft', 'neutral', 'Draft'],
    ['active', 'success', 'Active'],
    ['archived', 'neutral', 'Archived'],
  ] as const)('maps %s to localized badge props', (status, variant, label) => {
    expect(ledgerAccountMapper.mapStatusToBadgeProps(status)).toEqual({
      variant,
      label,
    });
  });
});
