import { Button } from '@/shared/components/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/field';
import { Input } from '@/shared/components/input';
import { useFieldErrorMessage } from '@/shared/hooks/use-field-error-message';
import { cn } from '@/shared/lib/utils/cn';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type {
  IRequestPasswordResetFormValues,
  RequestPasswordResetFormProps,
} from './types';
import { useRequestPasswordResetFormValidation } from './validation';

const EMAIL_ERROR_ID = 'request-password-reset-email-error';

export function RequestPasswordResetForm({
  className,
  onSubmit,
  loading,
  ...props
}: Readonly<RequestPasswordResetFormProps>) {
  const { t } = useTranslation('auth');

  const validationSchema = useRequestPasswordResetFormValidation();

  const formik = useFormik<IRequestPasswordResetFormValues>({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (loading) return;

      await onSubmit(values);
    },
  });

  const getErrorMessage = useFieldErrorMessage({
    errors: formik.errors,
    touched: formik.touched,
  });

  const email_label = t('email_label');
  const get_password_reset_link_text = t('get_password_reset_link_text');
  const back_to_sign_in_text = t('back_to_sign_in_text');

  const emailErrorMessage = getErrorMessage('email');
  const hasEmailError = emailErrorMessage.length > 0;

  return (
    <form
      onSubmit={formik.handleSubmit}
      className={cn('flex w-full max-w-full min-w-0 flex-col gap-6', className)}
      aria-busy={loading || undefined}
      {...props}
    >
      <FieldGroup>
        <Field data-invalid={hasEmailError || undefined}>
          <div>
            <FieldLabel htmlFor="email">{email_label}</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={loading}
              aria-invalid={hasEmailError ? true : undefined}
              aria-describedby={hasEmailError ? EMAIL_ERROR_ID : undefined}
            />
            <FieldError id={EMAIL_ERROR_ID} errors={emailErrorMessage} />
          </div>
        </Field>

        <Field className="mt-2">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {get_password_reset_link_text}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          <Link
            to="/auth/signin"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            {back_to_sign_in_text}
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
