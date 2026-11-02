import { CounterpartiesTableContainer } from '@/counterparty/components/counterparties-table';
import type { UCounterpartyRoleSelectValue } from '@/counterparty/components/counterparty-role-select';
import { CounterpartyCreationDialog } from '@/counterparty/dialogs/counterparty-creation';
import { CounterpartyRoleSelectionDialog } from '@/counterparty/dialogs/counterparty-role-selection';
import { AppBody } from '@/shared/components/app';
import { AppSection } from '@/shared/components/app-section';
import { Button } from '@/shared/components/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CounterpartyOverviewContainer } from './parts/counterparty-overview.container';

export function CounterpartiesPage() {
  const { t } = useTranslation(['shared', 'counterparty', 'navigation']);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const [selectedRole, setSelectedRole] =
    useState<UCounterpartyRoleSelectValue | null>(null);

  const handleRoleSelected = (role: UCounterpartyRoleSelectValue) => {
    setShowRoleSelection(false);
    setSelectedRole(role);
  };

  const page_title = t('shared:counterparties');
  const page_description = t('counterparty:overview_description');
  const overview_title = t('counterparty:overview_title');
  const table_title = t('counterparty:all_counterparties_label');
  const add_label = t('counterparty:add_counterparty');
  const configuration_label = t('navigation:configuration');

  return (
    <>
      <AppBody
        title={page_title}
        description={page_description}
        breadcrumbs={{
          label: configuration_label,
          next: { label: page_title },
        }}
        actionsSlot={
          <Button onClick={() => setShowRoleSelection(true)}>
            <Plus data-icon="inline-start" aria-hidden />
            {add_label}
          </Button>
        }
      >
        <AppSection title={overview_title}>
          <CounterpartyOverviewContainer />
        </AppSection>
        <AppSection title={table_title}>
          <CounterpartiesTableContainer />
        </AppSection>
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
