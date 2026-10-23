import { CounterpartiesTableContainer } from '@/counterparty/components/counterparties-table';
import type { UCounterpartyRoleSelectValue } from '@/counterparty/components/counterparty-role-select';
import { CounterpartyCreationDialog } from '@/counterparty/dialogs/counterparty-creation';
import { CounterpartyRoleSelectionDialog } from '@/counterparty/dialogs/counterparty-role-selection';
import { AppBody } from '@/shared/components/app';
import { useState } from 'react';

export function CounterpartiesPage() {
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const [selectedRole, setSelectedRole] =
    useState<UCounterpartyRoleSelectValue | null>(null);

  const handleRoleSelected = (role: UCounterpartyRoleSelectValue) => {
    setShowRoleSelection(false);
    setSelectedRole(role);
  };

  return (
    <>
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
