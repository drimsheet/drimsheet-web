import { Button } from '@/shared/components/button';
import { Calendar } from '@/shared/components/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/popover';
import { cn } from '@/shared/lib/utils/cn';
import { dateUtils } from '@/shared/lib/utils/date';
import { Calendar1 } from 'lucide-react';
import { useState } from 'react';

export interface DateInputProps extends Omit<
  React.ComponentProps<typeof Button>,
  'onChange' | 'value'
> {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  countryCode?: string;
  disabledDates?: React.ComponentProps<typeof Calendar>['disabled'];
}

const parseDateValue = (value?: string) => {
  if (!value) return undefined;

  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) return undefined;

  const date = new Date(year, month - 1, day);

  if (!dateUtils.isValidDate(date)) return undefined;

  return date;
};

function DateInput({
  value,
  onValueChange,
  placeholder = 'Select date',
  countryCode,
  disabledDates,
  className,
  disabled,
  ...props
}: Readonly<DateInputProps>) {
  const [open, setOpen] = useState(false);

  const selectedDate = parseDateValue(value);

  const displayValue = selectedDate
    ? dateUtils.formatWithJurisdiction(selectedDate, countryCode)
    : placeholder;

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    onValueChange?.(dateUtils.formatDateForApi(date));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            className
          )}
          {...props}
        >
          <Calendar1 data-icon="inline-start" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate}
          disabled={disabledDates}
          formatters={{
            formatMonthCaption: (date) =>
              date.toLocaleString(undefined, {
                month: 'long',
                year: 'numeric',
              }),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DateInput };
