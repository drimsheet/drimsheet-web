import type { IAccountingEntity, TEntityId } from '@/shared/lib/api/Api';
import { ProfileEntities } from '@/user/pages/profile/parts/profile-entities';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const entity: IAccountingEntity = {
  id: 'entity-id' as TEntityId,
  name: 'Northstar Studio',
  type: 'private_company',
  ownerId: 'user-id' as TEntityId,
  createdBy: 'user-id' as TEntityId,
  jurisdictionCode: 'NG',
  functionalCurrencyCode: 'NGN',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ProfileEntities', () => {
  it('distinguishes the active entity from ownership without inventing roles', () => {
    render(
      <ProfileEntities
        entities={[
          entity,
          {
            ...entity,
            id: 'other-id' as TEntityId,
            name: 'Other entity',
            ownerId: 'another-user' as TEntityId,
          },
        ]}
        userId="user-id"
        activeEntityId="other-id"
      />
    );
    const rows = screen.getAllByRole('listitem');
    expect(within(rows[0]).getByText('Owner')).toBeInTheDocument();
    expect(within(rows[0]).queryByText('Current')).not.toBeInTheDocument();
    expect(within(rows[1]).getByText('Current')).toBeInTheDocument();
    expect(within(rows[1]).queryByText('Owner')).not.toBeInTheDocument();
  });

  it('shows account setup guidance for an empty list', () => {
    render(<ProfileEntities entities={[]} userId="user-id" />);
    expect(screen.getByText('No legal entities yet')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
