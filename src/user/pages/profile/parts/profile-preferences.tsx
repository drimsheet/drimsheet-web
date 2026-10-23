import { Alert, AlertDescription } from '@/shared/components/alert';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/shared/components/field';
import { PageSection } from '@/shared/components/page-section';
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group';
import { Separator } from '@/shared/components/separator';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProfilePreferencesProps } from '../types';

export function ProfilePreferences({
  preferences,
  isSaving = false,
  isSaved = false,
  hasError = false,
  onChange,
}: Readonly<ProfilePreferencesProps>) {
  const { t } = useTranslation('user');
  const id = useId();

  const themes = [
    { value: 'light', label: t('profile_theme_light_label'), icon: Sun },
    { value: 'dark', label: t('profile_theme_dark_label'), icon: Moon },
    { value: 'system', label: t('profile_theme_system_label'), icon: Monitor },
  ] as const;

  const modes = [
    {
      value: 'non_power_user',
      label: t('profile_mode_automated_label'),
      description: t('profile_mode_automated_description'),
    },
    {
      value: 'power_user',
      label: t('profile_mode_manual_label'),
      description: t('profile_mode_manual_description'),
    },
  ] as const;

  const handleThemeChange = (value: string) => {
    const option = themes.find((theme) => theme.value === value);
    if (option) onChange({ theme: option.value });
  };

  const handleModeChange = (value: string) => {
    const option = modes.find((mode) => mode.value === value);
    if (option) onChange({ appUsageMode: option.value });
  };

  const preferences_title = t('profile_preferences_title');
  const preferences_description = t('profile_preferences_description');
  const theme_label = t('profile_theme_label');
  const mode_label = t('profile_mode_label');
  const save_error_text = t('profile_preferences_save_error');
  let save_status = t('profile_preferences_auto_save_text');

  if (isSaving) save_status = t('profile_preferences_saving_text');
  else if (isSaved) save_status = t('profile_preferences_saved_text');

  return (
    <PageSection
      title={preferences_title}
      className="h-full min-w-0"
      role="region"
      titleId="profile-preferences-title"
      aria-busy={isSaving}
    >
      <p className="text-sm text-muted-foreground">{preferences_description}</p>

      <div>
        <FieldGroup>
          <FieldSet disabled={isSaving}>
            <FieldLegend variant="label" id={`${id}-theme`}>
              {theme_label}
            </FieldLegend>
            <RadioGroup
              aria-labelledby={`${id}-theme`}
              value={preferences.theme ?? 'dark'}
              onValueChange={handleThemeChange}
              disabled={isSaving}
              className="grid-cols-3"
            >
              {themes.map(({ value, label, icon: Icon }) => (
                <FieldLabel key={value} htmlFor={`${id}-${value}`}>
                  <Field
                    orientation="horizontal"
                    className="flex-col items-center gap-2"
                    data-disabled={isSaving}
                  >
                    <Icon className="size-5" aria-hidden />
                    <FieldTitle>{label}</FieldTitle>
                    <RadioGroupItem id={`${id}-${value}`} value={value} />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          </FieldSet>
          <Separator />
          <FieldSet disabled={isSaving}>
            <FieldLegend variant="label" id={`${id}-mode`}>
              {mode_label}
            </FieldLegend>
            <RadioGroup
              aria-labelledby={`${id}-mode`}
              value={preferences.appUsageMode}
              onValueChange={handleModeChange}
              disabled={isSaving}
            >
              {modes.map(({ value, label, description }) => (
                <FieldLabel key={value} htmlFor={`${id}-${value}`}>
                  <Field orientation="horizontal" data-disabled={isSaving}>
                    <FieldContent>
                      <FieldTitle id={`${id}-${value}-label`}>
                        {label}
                      </FieldTitle>
                      <FieldDescription id={`${id}-${value}-description`}>
                        {description}
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      id={`${id}-${value}`}
                      value={value}
                      aria-labelledby={`${id}-${value}-label`}
                      aria-describedby={`${id}-${value}-description`}
                    />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          </FieldSet>
          {hasError && (
            <Alert variant="destructive">
              <AlertDescription>{save_error_text}</AlertDescription>
            </Alert>
          )}
        </FieldGroup>
      </div>
      <div className="mt-auto flex items-center gap-2">
        {isSaved && <Check className="size-3.5 text-success" aria-hidden />}
        <output className="text-xs text-muted-foreground">{save_status}</output>
      </div>
    </PageSection>
  );
}
