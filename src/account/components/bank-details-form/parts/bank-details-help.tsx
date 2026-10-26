import { Button } from '@/shared/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/tooltip';
import { Info } from 'lucide-react';
import { useRef, useState, type MouseEvent } from 'react';
import type { BankDetailsHelpProps } from '../types';

export function BankDetailsHelp({
  description,
  triggerLabel,
}: Readonly<BankDetailsHelpProps>) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!pinned) {
      setOpen(nextOpen);
    }
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const nextPinned = !pinned;

    setPinned(nextPinned);
    setOpen(nextPinned);
  };

  const handleDismiss = () => {
    setPinned(false);
    setOpen(false);
  };

  const handlePointerDownOutside = (
    event: CustomEvent<{ originalEvent: PointerEvent }>
  ) => {
    const target = event.detail.originalEvent.target;

    if (target instanceof Node && triggerRef.current?.contains(target)) {
      return;
    }

    handleDismiss();
  };

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <Button
            ref={triggerRef}
            className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            size="sm"
            type="button"
            variant="ghost"
            onBlur={handleDismiss}
            onClick={handleClick}
          >
            {triggerLabel}
            <Info aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          align="start"
          side="bottom"
          className="leading-relaxed"
          onEscapeKeyDown={handleDismiss}
          onPointerDownOutside={handlePointerDownOutside}
        >
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
