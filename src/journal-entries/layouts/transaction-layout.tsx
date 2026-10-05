import { Tabs, type ITabItem } from '@/shared/components/tabs';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export function TransactionLayout() {
  const { t } = useTranslation('journal-entries');
  const location = useLocation();
  const navigate = useNavigate();

  const items: ITabItem[] = [
    { value: 'inflow', label: t('inflow_tab') },
    { value: 'outflow', label: t('outflow_tab') },
    { value: 'transfer', label: t('transfer_tab') },
  ];

  const activeValue = location.pathname.split('/').at(-1) ?? 'inflow';
  const tabs_aria_label = t('tabs_aria_label');

  return (
    <div className="flex flex-col gap-8">
      <Tabs
        items={items}
        value={activeValue}
        ariaLabel={tabs_aria_label}
        onValueChange={(value) => navigate(`/transactions/${value}`)}
      />
      <Outlet />
    </div>
  );
}
