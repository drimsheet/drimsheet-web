export interface CounterpartyTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: Array<{ message?: string } | undefined>;
  disabled?: boolean;
  loading?: boolean;
  description?: string;
}
