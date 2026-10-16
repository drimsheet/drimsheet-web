import { NavMain } from '@/_app/components/nav-main';
import { useTranslation } from 'react-i18next';
import type { NavConfigurationsProps } from './types';

export function NavConfigurations({ items }: Readonly<NavConfigurationsProps>) {
  const { t } = useTranslation('navigation');

  const configuration_label = t('configuration');

  return <NavMain label={configuration_label} items={items} />;
}
