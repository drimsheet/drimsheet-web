import { LegalEntityList } from '@/accounting/pages/legal-entity/parts/entity-list';
import type { IAccountingEntity, TEntityId } from '@/shared/lib/api/Api';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';

it('explains an empty list without showing records', () => {
  render(
    <MemoryRouter>
      <LegalEntityList
        entities={[]}
        getEntityHref={(entity) => `/legal-entity/${entity.id}`}
      />
    </MemoryRouter>
  );

  expect(screen.getByText('No legal entities yet')).toBeVisible();
  expect(
    screen.getByText(
      'Add a legal entity to keep records for a person or business.'
    )
  ).toBeVisible();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});

it('retains archived entities and falls back to the jurisdiction code when its name is unavailable', () => {
  const entity: IAccountingEntity = {
    id: '00000000-0000-4000-8000-000000000001' as TEntityId,
    createdBy: '00000000-0000-4000-8000-000000000002' as TEntityId,
    ownerId: '00000000-0000-4000-8000-000000000002' as TEntityId,
    name: 'Archived Studio',
    type: 'private_company',
    status: 'archived',
    jurisdictionCode: 'ZZ' as IAccountingEntity['jurisdictionCode'],
    functionalCurrencyCode: 'NGN',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  render(
    <MemoryRouter>
      <LegalEntityList
        entities={[entity]}
        getEntityHref={(item) => `/legal-entity/${item.id}`}
      />
    </MemoryRouter>
  );

  expect(
    screen.getByRole('list', { name: 'Your accounting entities' })
  ).toBeVisible();
  expect(
    screen.getByRole('heading', { name: 'Archived Studio' })
  ).toBeVisible();
  expect(screen.getByText('Archived')).toBeVisible();
  expect(screen.getByText('ZZ')).toBeVisible();
  expect(screen.getByLabelText('Functional currency: NGN')).toBeVisible();
});
