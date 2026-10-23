import { Avatar, AvatarFallback } from '@/shared/components/avatar';
import type { AccountingEntityAvatarProps } from './types';

export function AccountingEntityAvatar({
  fallbackClassName,
  name,
  ...props
}: Readonly<AccountingEntityAvatarProps>) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  let initials = '?';

  if (words.length === 1) {
    initials = words[0].slice(0, 2).toUpperCase();
  } else if (words.length > 1) {
    initials = `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
  }

  return (
    <Avatar {...props}>
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
}
