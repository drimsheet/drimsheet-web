import type { IUserProfileDto } from '@/shared/lib/api/Api';
import type { ReactNode } from 'react';

export interface ProfileUpdateDialogProps {
  profile: IUserProfileDto;
  trigger: ReactNode;
}
