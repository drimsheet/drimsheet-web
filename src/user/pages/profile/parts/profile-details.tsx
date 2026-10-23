import { Avatar, AvatarFallback } from '@/shared/components/avatar';
import { Badge } from '@/shared/components/badge';
import { PageSection } from '@/shared/components/page-section';
import { Separator } from '@/shared/components/separator';
import { Skeleton } from '@/shared/components/skeleton';
import { BadgeCheck, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProfileDetailsProps } from '../types';

export function ProfileDetails({
  profile,
  editAction,
}: Readonly<ProfileDetailsProps>) {
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
    <PageSection
      title={details_title}
      className="h-full min-w-0"
      role="region"
      titleId="profile-details-title"
    >
      <div className="flex flex-col gap-6">
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
        {editAction && <div className="self-start">{editAction}</div>}
      </div>
    </PageSection>
  );
}

export function ProfileDetailsSkeleton() {
  const { t } = useTranslation('user');
  const loading_label = t('profile_details_title');

  const profile_section_loading_text = t('profile_section_loading_text', {
    section: loading_label,
  });

  return (
    <PageSection
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
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-7 w-40 max-w-full" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-x-5 gap-y-6">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-full max-w-56" />
          </div>
          {[0, 1, 2, 3].map((field) => (
            <div key={field} className="flex min-w-0 flex-col gap-1.5">
              <Skeleton className="h-4 w-full max-w-24" />
              <Skeleton className="h-6 w-full max-w-32" />
            </div>
          ))}
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
    </PageSection>
  );
}
