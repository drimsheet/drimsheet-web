import type { IJurisdictionDto } from '@/shared/lib/api/Api';

export interface CountryComboBoxProps {
  label: string;
  id?: string;
  disabled?: boolean;
  description?: string;
  clearable?: boolean;
  value: string;
  jurisdictions: IJurisdictionDto[];
  onChange: (value: string) => void;
  error?: Array<{ message?: string } | undefined>;
}
