import { CounterpartiesTableContainer } from '@/counterparty/components/counterparties-table';
import type { UCounterpartyRoleSelectValue } from '@/counterparty/components/counterparty-role-select';
import { CounterpartyCreationDialog } from '@/counterparty/dialogs/counterparty-creation';
import { CounterpartyRoleSelectionDialog } from '@/counterparty/dialogs/counterparty-role-selection';
import { AppBody } from '@/shared/components/app';
import { PageSection } from '@/shared/components/page-section';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function CounterpartiesPage() {
  const { t } = useTranslation('shared');
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const [selectedRole, setSelectedRole] =
    useState<UCounterpartyRoleSelectValue | null>(null);

  const handleRoleSelected = (role: UCounterpartyRoleSelectValue) => {
    setShowRoleSelection(false);
    setSelectedRole(role);
  };

  const page_title = t('counterparties');

  return (
    <>
      <AppBody title={page_title}>
        <PageSection>
          <CounterpartiesTableContainer
            onAddCounterparty={() => setShowRoleSelection(true)}
          />
        </PageSection>
        <CounterpartyRoleSelectionDialog
          open={showRoleSelection}
          onClose={() => setShowRoleSelection(false)}
          onSubmit={handleRoleSelected}
        />

        {selectedRole && (
          <CounterpartyCreationDialog
            open
            role={selectedRole}
            onClose={() => setSelectedRole(null)}
          />
        )}
      </AppBody>
    </>
  );
}
