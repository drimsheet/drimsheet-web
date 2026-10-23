import type { ReactNode } from 'react';
export interface ITableFilterOption {
  label: string;
  value: string | number;
}
export interface TableFilterProps {
  title?: string;
  multiple?: boolean;
  options: ITableFilterOption[];
  selectedValues: (string | number)[];
  onApply: (values: (string | number)[]) => void;
  trigger?: ReactNode;
  disabled?: boolean;
}
