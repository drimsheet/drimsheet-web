import {
  expenseBehavior,
  revenueBehavior,
  suspenseType,
} from '@/accounting/dialogs/accounting-entity-creation/validation';
import locale from '@/accounting/i18n/locales/en/accounting.json';
import { describe, expect, it } from 'vitest';
describe('onboarding API value narrowing', () => {
  const message = locale.onboarding_invalid_catalog_error;
  it('narrows supported creation values', () => {
    expect(revenueBehavior('services', message)).toBe('services');
    expect(expenseBehavior('interest', message)).toBe('interest');
    expect(suspenseType('asset', message)).toBe('asset');
    expect(suspenseType('liability', message)).toBe('liability');
  });
  it('uses the supplied translated error for unsupported values', () => {
    expect(() => revenueBehavior('unknown', message)).toThrow(message);
    expect(() => expenseBehavior('unknown', message)).toThrow(message);
    expect(() => suspenseType('equity', message)).toThrow(message);
  });
});
