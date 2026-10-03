import { useFieldErrorMessage } from '@/shared/hooks/use-field-error-message';
import { dateUtils } from '@/shared/lib/utils/date';
import { useFormik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccountingEntityCreationFormStep1 } from './parts/first-step';
import { AccountingEntityCreationFormStep2 } from './parts/second-step';
import { AccountingEntityCreationFormStep3 } from './parts/third-step';
import type {
  AccountingEntityCreationFormProps,
  IAccountingEntityFormValues,
} from './types';
import { useAccountingEntityCreationFormValidation } from './validation';

function AccountingEntityCreationForm({
  onSubmit,
  individualName = '',
  loading,
  currencies = [],
  jurisdictions = [],
}: Readonly<AccountingEntityCreationFormProps>) {
  const { t } = useTranslation('accounting');
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const validationSchema =
    useAccountingEntityCreationFormValidation(jurisdictions);

  const handleNext = (nextStep: number) => {
    setDirection('right');
    setStep(nextStep);
  };

  const handleBack = (prevStep: number) => {
    setDirection('left');
    setStep(prevStep);
  };

  const formik = useFormik<IAccountingEntityFormValues>({
    initialValues: {
      name: '',
      entityType: '',
      countryCode: 'NG',
      functionalCurrency: 'NGN',
      reportingCurrency: 'NGN',
      fiscalYearStart: dateUtils.getFiscalYearDateRange(1, 1).startDate,
      fiscalYearEnd: dateUtils.getFiscalYearDateRange(1, 1).endDate,
      appUsageMode: 'non_power_user',
      accountingStandardCode: 'IFRS',
    },
    validationSchema,
    onSubmit: (values) => onSubmit(values),
  });

  const getErrorMessage = useFieldErrorMessage({
    errors: formik.errors,
    touched: formik.touched,
  });

  const getFiscalYearStartErrorStr = () => {
    const err = formik.errors.fiscalYearStart;
    const touch = formik.touched.fiscalYearStart;
    if (touch && typeof err === 'string') return err;
    return undefined;
  };

  const getFiscalYearEndErrorStr = () => {
    const err = formik.errors.fiscalYearEnd;
    const touch = formik.touched.fiscalYearEnd;
    if (touch && typeof err === 'string') return err;
    return undefined;
  };

  const step_status = t('step_status', { step, totalSteps: 3 });

  return (
    <div className="min-w-xs max-w-full">
      <form id="accounting-entity-form" onSubmit={formik.handleSubmit}>
        <p className="sr-only" role="status" aria-live="polite">
          {step_status}
        </p>
        <div
          key={step}
          className={
            direction === 'right'
              ? 'animate-slide-step-right'
              : 'animate-slide-step-left'
          }
        >
          {step === 1 && (
            <AccountingEntityCreationFormStep1
              formik={formik}
              getErrorMessage={getErrorMessage}
              individualName={individualName}
              jurisdictions={jurisdictions}
              onNext={() => handleNext(2)}
            />
          )}
          {step === 2 && (
            <AccountingEntityCreationFormStep2
              formik={formik}
              getErrorMessage={getErrorMessage}
              getFiscalYearStartErrorStr={getFiscalYearStartErrorStr}
              getFiscalYearEndErrorStr={getFiscalYearEndErrorStr}
              currencies={currencies}
              onNext={() => handleNext(3)}
              onBack={() => handleBack(1)}
            />
          )}
          {step === 3 && (
            <AccountingEntityCreationFormStep3
              formik={formik}
              getErrorMessage={getErrorMessage}
              onBack={() => handleBack(2)}
              isSubmitting={loading ?? false}
            />
          )}
        </div>
      </form>
    </div>
  );
}

export { AccountingEntityCreationForm };
