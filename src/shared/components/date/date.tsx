import { cn } from '@/shared/lib/utils/cn';
import { dateUtils } from '@/shared/lib/utils/date';
import { useTranslation } from 'react-i18next';

interface FormattedDateProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: Date;
  countryCode?: string;
}

function FormattedDate({
  value,
  className,
  countryCode,
  ...props
}: Readonly<FormattedDateProps>) {
  const { t } = useTranslation('shared');
  const invalid_date_text = t('invalid_date_text');

  return (
    <span
      className={cn('text-xs text-muted-foreground font-medium', className)}
      {...props}
    >
      {dateUtils.formatWithJurisdiction(value, countryCode) ??
        invalid_date_text}
    </span>
  );
}

export { FormattedDate };
