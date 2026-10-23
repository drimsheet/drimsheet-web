import { useAccountingEntities } from '@/accounting/hooks/use-accounting-entities';
import { useAccountingEntity } from '@/accounting/hooks/use-accounting-entity';
import { AppBody } from '@/shared/components/app';
import { Button } from '@/shared/components/button';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import type { IUserPreferencesUpdateDto } from '@/shared/lib/api/Api';
import { storageService } from '@/shared/lib/services/storage.service';
import { ProfileUpdateDialog } from '@/user/dialogs/profile-update';
import { usePreferences } from '@/user/hooks/use-preferences';
import { useProfile } from '@/user/hooks/use-profile';
import { useUpdatePreferences } from '@/user/hooks/use-update-preferences';
import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProfileDetails } from './parts/profile-details';
import { ProfileEntities } from './parts/profile-entities';
import { ProfilePreferences } from './parts/profile-preferences';
import { ProfileSectionState } from './parts/profile-section-state';

export function ProfilePage() {
  const { t } = useTranslation('user');
  const profileQuery = useProfile();
  const preferencesQuery = usePreferences();
  const entitiesQuery = useAccountingEntities({ throwOnError: false });

  const { data: activeEntity } = useAccountingEntity({
    disabled: !entitiesQuery.data?.length,
    throwOnError: false,
  });

  const updatePreferences = useUpdatePreferences();
  const handleApiError = useApiErrorHandler();
  const profile = profileQuery.data;
  const preferences = preferencesQuery.data;
  const entities = entitiesQuery.data;

  const handlePreferenceChange = (payload: IUserPreferencesUpdateDto) => {
    updatePreferences.mutate(payload, {
      onSuccess: (result) => {
        if (!payload.theme) return;

        const theme = result.appPreferences.theme ?? 'system';
        storageService.set({ theme });

        const isDark =
          theme === 'dark' ||
          (theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

        document.documentElement.classList.toggle('dark', isDark);
      },
      onError: (error) => handleApiError(error),
    });
  };

  const profile_title = t('profile_title');
  const profile_description = t('profile_description');
  const details_title = t('profile_details_title');
  const preferences_title = t('profile_preferences_title');
  const entities_title = t('profile_entities_title');
  const edit_label = t('profile_edit_label');

  return (
    <>
      <AppBody>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-1 pb-6 sm:px-4">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-3xl font-semibold tracking-tight">
              {profile_title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {profile_description}
            </p>
          </div>
          <div className="grid items-stretch gap-6 lg:grid-cols-2">
            {profile ? (
              <ProfileDetails
                profile={profile}
                editAction={
                  <ProfileUpdateDialog
                    profile={profile}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Pencil
                          className="size-3.5"
                          data-icon="inline-start"
                          aria-hidden
                        />
                        {edit_label}
                      </Button>
                    }
                  />
                }
              />
            ) : (
              <ProfileSectionState
                isLoading={profileQuery.isPending}
                label={details_title}
                onRetry={() => void profileQuery.refetch()}
              />
            )}
            {preferences ? (
              <ProfilePreferences
                preferences={preferences.appPreferences}
                onChange={handlePreferenceChange}
                isSaving={updatePreferences.isPending}
                isSaved={updatePreferences.isSuccess}
                hasError={updatePreferences.isError}
              />
            ) : (
              <ProfileSectionState
                isLoading={preferencesQuery.isPending}
                label={preferences_title}
                onRetry={() => void preferencesQuery.refetch()}
              />
            )}
          </div>
          {entities ? (
            <ProfileEntities
              entities={entities}
              activeEntityId={activeEntity?.id}
              userId={profile?.id ?? ''}
            />
          ) : (
            <ProfileSectionState
              isLoading={entitiesQuery.isPending}
              label={entities_title}
              onRetry={() => void entitiesQuery.refetch()}
            />
          )}
        </div>
      </AppBody>
    </>
  );
}
