import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/dialog';
import { useApiErrorHandler } from '@/shared/hooks/use-api-error-handler';
import {
  ProfileForm,
  type IProfileFormValues,
} from '@/user/components/profile-form';
import { useUpdateProfile } from '@/user/hooks/use-update-profile';
import { mapProfileFormToDto } from '@/user/lib/mappers/profile.mapper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ProfileUpdateDialogProps } from './types';

export function ProfileUpdateDialog({
  profile,
  trigger,
}: Readonly<ProfileUpdateDialogProps>) {
  const { t } = useTranslation('user');
  const [open, setOpen] = useState(false);
  const updateProfile = useUpdateProfile();
  const handleApiError = useApiErrorHandler();

  const handleOpenChange = (nextOpen: boolean) => {
    if (updateProfile.isPending) return;

    updateProfile.reset();
    setOpen(nextOpen);
  };

  const handleSubmit = async (values: IProfileFormValues) => {
    try {
      await updateProfile.mutateAsync(mapProfileFormToDto(values));
      toast.success(t('profile_saved_text'));
      setOpen(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const title_text = t('profile_edit_title');
  const description_text = t('profile_edit_description');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
        showCloseButton={!updateProfile.isPending}
      >
        <DialogHeader>
          <DialogTitle>{title_text}</DialogTitle>
          <DialogDescription>{description_text}</DialogDescription>
        </DialogHeader>
        <ProfileForm
          initialValues={{
            firstName: profile.firstName,
            lastName: profile.lastName,
          }}
          isSaving={updateProfile.isPending}
          hasError={updateProfile.isError}
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
