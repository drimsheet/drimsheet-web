import { Button } from '@/shared/components/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/popover';
import { Info } from 'lucide-react';
import type { CategoryHelpProps } from '../types';

export function CategoryHelp({ label, children }: Readonly<CategoryHelpProps>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={label}>
          <Info aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label={label} align="start">
        {children}
      </PopoverContent>
    </Popover>
  );
}
