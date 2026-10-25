import { Alert, AlertDescription } from '@/shared/components/alert';
import { AppSection } from '@/shared/components/app-section';
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
import { RadioGroup, RadioGroupItem } from '@/shared/components/radio-group';
import { Separator } from '@/shared/components/separator';
import { Skeleton } from '@/shared/components/skeleton';
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
    <AppSection
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
    </AppSection>
  );
}

export function ProfilePreferencesSkeleton() {
  const { t } = useTranslation('user');
  const loading_label = t('profile_preferences_title');

  const profile_section_loading_text = t('profile_section_loading_text', {
    section: loading_label,
  });

  return (
    <AppSection
      aria-busy="true"
      title={loading_label}
      className="h-full min-w-0"
    >
      <output
        className="sr-only"
        aria-label={profile_section_loading_text}
        aria-busy="true"
      >
        {profile_section_loading_text}
      </output>
      <Skeleton className="h-5 w-full" />
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-20" />
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((theme) => (
              <div
                key={theme}
                className="flex flex-col items-center gap-2 rounded-lg border p-4"
              >
                <Skeleton className="size-5" />
                <Skeleton className="h-5 w-full max-w-14" />
                <Skeleton className="size-4 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28" />
          {[0, 1].map((mode) => (
            <div
              key={mode}
              className="flex items-center gap-3 rounded-lg border p-4"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-5 w-full max-w-36" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="size-4 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="mt-auto h-4 w-40" />
    </AppSection>
  );
}
