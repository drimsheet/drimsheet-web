import { currencyService } from '@/shared/lib/services/currency.service';
import { toMajorUnits } from '@/shared/lib/utils/money';
import { useTranslation } from 'react-i18next';
import type { MoneyProps } from './types';

export function Money({
  value,
  localCode,
  hide,
  hideZeroMinorUnit = true,
  isConverted = false,
  approximationClassName,
  notation,
  signDisplay,
  currencyDisplay,
  maximumFractionDigits,
  ...props
}: Readonly<MoneyProps>) {
  const { t } = useTranslation('shared');

  const locale = currencyService.getJurisdictionLocale(
    localCode || value.currencyCode
  );

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currencyCode,
    notation,
    signDisplay,
    currencyDisplay,
    maximumFractionDigits,
    trailingZeroDisplay: hideZeroMinorUnit ? 'stripIfInteger' : 'auto',
  }).format(toMajorUnits(value));

  const approximately_label = t('money_approximately_label');

  return (
    <span {...props}>
      {isConverted && (
        <>
          <span aria-hidden="true" className={approximationClassName}>
            ≈
          </span>
          <span className="sr-only">{approximately_label} </span>
        </>
      )}
      {hide ? '******' : formatted}
    </span>
  );
}
