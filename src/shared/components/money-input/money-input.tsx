// TODO: move business logic to service/helpers

import { Input } from '@/shared/components/input';
import countries from '@/shared/configs/countries.json';
import currencies from '@/shared/configs/currencies.json';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import type { MoneyInputProps } from './types';

const parseRawValue = (val: string | number | undefined | null) => {
  if (val === null || val === undefined || val === '') return '';

  const strVal = String(val);
  const isNegative = strVal.startsWith('-');
  const rawNumeric = strVal.replace(/[^0-9.]/g, '');
  if (!rawNumeric) return isNegative ? '-' : '';

  const parts = rawNumeric.split('.');

  const cleanNumeric =
    parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : rawNumeric;

  return isNegative ? '-' + cleanNumeric : cleanNumeric;
};

const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  (componentProps, ref) => {
    const {
      className,
      currencyCode,
      decimalType = 'money',
      locale,
      value,
      onChange,
      onBlur,
      ...props
    } = componentProps;

    const resolvedLocale = useMemo(() => {
      if (locale) return locale;

      if (currencyCode) {
        const country = countries.find((c) => c.currencyCode === currencyCode);
        if (country?.locale) return country.locale;
      }

      return undefined;
    }, [locale, currencyCode]);

    const preservesFractionalDigits = decimalType === 'number';

    const maxDecimals = useMemo(() => {
      if (currencyCode) {
        const currency = currencies.find((c) => c.code === currencyCode);
        if (currency?.minorUnit !== undefined) {
          return currency.minorUnit;
        }

        return (
          new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: currencyCode,
          }).resolvedOptions().maximumFractionDigits ?? 2
        );
      }

      return 2;
    }, [currencyCode]);

    const intFormatter = useMemo(() => {
      return new Intl.NumberFormat(resolvedLocale, {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }, [resolvedLocale]);

    const formatVal = useCallback(
      (val: string | number | undefined | null) => {
        const cleanVal = parseRawValue(val);
        if (!cleanVal || cleanVal === '-') return cleanVal;

        const isNegative = cleanVal.startsWith('-');
        const numericStr = isNegative ? cleanVal.slice(1) : cleanVal;

        const parts = numericStr.split('.');
        const integerPart = parts[0] || '0';
        let decimalPart = '';

        if (parts.length > 1) {
          if (preservesFractionalDigits) {
            decimalPart = '.' + parts[1];
          } else if (maxDecimals > 0) {
            decimalPart = '.' + parts[1].slice(0, maxDecimals);
          }
        }

        const num = Number(integerPart);
        if (Number.isNaN(num)) return isNegative ? '-' : '';

        const formattedInteger = intFormatter.format(num);

        return (isNegative ? '-' : '') + formattedInteger + decimalPart;
      },
      [intFormatter, maxDecimals, preservesFractionalDigits]
    );

    const [prevValueProp, setPrevValueProp] = useState(value);
    const [prevFormatVal, setPrevFormatVal] = useState(() => formatVal);

    const [localValue, setLocalValue] = useState(() =>
      formatVal(parseRawValue(value))
    );

    const shouldSyncLocalValue =
      !Object.is(value, prevValueProp) || formatVal !== prevFormatVal;

    if (shouldSyncLocalValue) {
      setPrevValueProp(value);
      setPrevFormatVal(() => formatVal);

      const rawLocal = parseRawValue(localValue);
      const rawProps = parseRawValue(value);

      const numLocal = Number(
        rawLocal === '-' || rawLocal === '' ? '0' : rawLocal
      );

      const numProps = Number(
        rawProps === '-' || rawProps === '' ? '0' : rawProps
      );

      const isNumericallyEqual = numLocal === numProps;

      const isOneEmpty =
        (rawLocal === '' && rawProps !== '') ||
        (rawLocal !== '' && rawProps === '');

      const needsReformat = localValue !== formatVal(rawLocal);

      if (!isNumericallyEqual || isOneEmpty || needsReformat) {
        if (isNumericallyEqual && needsReformat) {
          setLocalValue(formatVal(rawLocal));
        } else {
          setLocalValue(formatVal(rawProps));
        }
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanValue = parseRawValue(e.target.value);
      setLocalValue(formatVal(cleanValue));

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: cleanValue,
            name: e.target.name,
            id: e.target.id,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const rawLocal = parseRawValue(localValue);

      if (rawLocal.endsWith('.')) {
        setLocalValue(formatVal(rawLocal.slice(0, -1)));
      } else if (rawLocal === '-') {
        setLocalValue('');
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: '' },
          } as React.ChangeEvent<HTMLInputElement>;

          onChange(syntheticEvent);
        }
      }

      if (onBlur) {
        onBlur(e);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        className={className}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  }
);

MoneyInput.displayName = 'MoneyInput';

export { MoneyInput };
