import type {
  IAccountingEntity,
  IUserAppPreferences,
  IUserPreferencesUpdateDto,
  IUserProfileDto,
} from '@/shared/lib/api/Api';

export interface ProfileDetailsProps {
  profile: IUserProfileDto;
}

export interface ProfilePreferencesProps {
  preferences: IUserAppPreferences;
  isSaving?: boolean;
  isSaved?: boolean;
  hasError?: boolean;
  onChange: (preferences: IUserPreferencesUpdateDto) => void;
}

export interface ProfileEntitiesProps {
  entities: IAccountingEntity[];
  userId: string;
  activeEntityId?: string;
}

export interface ProfileSectionStateProps {
  isLoading: boolean;
  label: string;
  onRetry: () => void;
}
