import { useTranslation } from 'react-i18next';

export function CashflowByCurrencyError() {
  const { t } = useTranslation('shared');
  const error_text = t('an_error_occurred');

  return (
    <p role="alert" className="text-sm text-destructive">
      {error_text}
    </p>
  );
}
