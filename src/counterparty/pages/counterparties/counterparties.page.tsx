import { CounterpartiesTableContainer } from '@/counterparty/components/counterparties-table';
import type { UCounterpartyRoleSelectValue } from '@/counterparty/components/counterparty-role-select';
import { CounterpartyCreationDialog } from '@/counterparty/dialogs/counterparty-creation';
import { CounterpartyRoleSelectionDialog } from '@/counterparty/dialogs/counterparty-role-selection';
import { AppBody, AppHeader } from '@/shared/components/app';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function CounterpartiesPage() {
  const { t } = useTranslation(['counterparty', 'shared']);

  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const [selectedRole, setSelectedRole] =
    useState<UCounterpartyRoleSelectValue | null>(null);

  const handleRoleSelected = (role: UCounterpartyRoleSelectValue) => {
    setShowRoleSelection(false);
    setSelectedRole(role);
  };

  const counterparties_label = t('shared:counterparties');

  return (
    <>
      <AppHeader breadcrumbs={[{ label: counterparties_label }]} />

      <AppBody>
        <CounterpartiesTableContainer
          onAddCounterparty={() => setShowRoleSelection(true)}
        />

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
