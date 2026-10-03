import {
  ETSupportedExpenseAccountBehavior,
  ETSupportedRevenueAccountBehavior,
  type ICreateSuspenseAccountDto,
} from '@/shared/lib/api/Api';
export function revenueBehavior(value: string, message: string) {
  const supported = Object.values(ETSupportedRevenueAccountBehavior).find(
    (behavior) => behavior === value
  );
  if (!supported) throw new Error(message);
  return supported;
}
export function expenseBehavior(value: string, message: string) {
  const supported = Object.values(ETSupportedExpenseAccountBehavior).find(
    (behavior) => behavior === value
  );
  if (!supported) throw new Error(message);
  return supported;
}
export function suspenseType(
  value: string,
  message: string
): ICreateSuspenseAccountDto['type'] {
  if (value !== 'asset' && value !== 'liability') throw new Error(message);
  return value;
}
