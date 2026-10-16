import { Avatar, AvatarFallback } from '@/shared/components/avatar';
import { Badge } from '@/shared/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/card';
import { Separator } from '@/shared/components/separator';
import { BadgeCheck, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProfileDetailsProps } from '../types';

export function ProfileDetails({ profile }: Readonly<ProfileDetailsProps>) {
  const { t, i18n } = useTranslation('user');

  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(' ');

  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}` ||
    profile.email.charAt(0);

  const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'medium',
  });

  const details_title = t('profile_details_title');

  const verification_label = profile.emailVerified
    ? t('profile_email_verified_label')
    : t('profile_email_unverified_label');

  const email_label = t('profile_email_label');

  const fields = [
    {
      label: t('profile_first_name_label'),
      value: profile.firstName || t('profile_not_set_text'),
    },
    {
      label: t('profile_last_name_label'),
      value: profile.lastName || t('profile_not_set_text'),
    },
    {
      label: t('profile_member_since_label'),
      value: dateFormatter.format(new Date(profile.createdAt)),
    },
    {
      label: t('profile_updated_label'),
      value: dateFormatter.format(new Date(profile.updatedAt)),
    },
  ];

  return (
    <Card
      className="h-full min-w-0"
      role="region"
      aria-labelledby="profile-details-title"
    >
      <CardHeader>
        <CardTitle role="heading" aria-level={2} id="profile-details-title">
          {details_title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-2">
            <p className="break-words text-xl font-semibold tracking-tight">
              {fullName || profile.email}
            </p>
            <Badge variant="outline">
              {profile.emailVerified && <BadgeCheck aria-hidden />}
              {verification_label}
            </Badge>
          </div>
        </div>
        <Separator />
        <dl className="grid grid-cols-2 gap-x-5 gap-y-6">
          <div className="col-span-2 flex flex-col gap-1.5">
            <dt className="text-xs text-muted-foreground">{email_label}</dt>
            <dd className="flex items-start gap-2 font-medium">
              <Mail
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="min-w-0 break-all">{profile.email}</span>
            </dd>
          </div>
          {fields.map(({ label, value }) => (
            <div key={label} className="flex min-w-0 flex-col gap-1.5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="break-words font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
