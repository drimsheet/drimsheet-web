import { AppBody } from '@/shared/components/app';
import { Label } from '@/shared/components/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export function TransactionLayout() {
  const { t } = useTranslation(['journal-entries', 'shared']);
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { value: 'inflow', label: t('inflow_tab') },
    { value: 'outflow', label: t('outflow_tab') },
    { value: 'transfer', label: t('transfer_tab') },
  ];

  const activeValue = location.pathname.split('/').at(-1) ?? 'inflow';
  const page_title = t('shared:new_transaction');
  const transaction_type_label = t('tabs_aria_label');
  const transactions_label = t('shared:transactions');

  return (
    <AppBody
      title={page_title}
      breadcrumbs={{
        label: transactions_label,
        link: '/transactions',
        next: { label: page_title },
      }}
    >
      <fieldset className="mt-7">
        <legend
          id="transaction-type-label"
          className="mb-2 text-sm font-medium text-muted-foreground"
        >
          {transaction_type_label}
        </legend>
        <RadioGroup
          className="flex flex-wrap gap-7"
          value={activeValue}
          aria-labelledby="transaction-type-label"
          onValueChange={(value) => navigate(`/transactions/${value}`)}
        >
          {items.map((item) => (
            <Label
              key={item.value}
              className="flex min-h-10 items-center gap-2 text-foreground"
            >
              <RadioGroupItem value={item.value} />
              {item.label}
            </Label>
          ))}
        </RadioGroup>
      </fieldset>
      <Outlet />
    </AppBody>
  );
}
