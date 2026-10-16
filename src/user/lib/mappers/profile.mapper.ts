import type { IUserProfileUpdateDto } from '@/shared/lib/api/Api';
import type { IProfileFormValues } from '@/user/components/profile-form';

export function mapProfileFormToDto(
  values: IProfileFormValues
): IUserProfileUpdateDto {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
  };
}
