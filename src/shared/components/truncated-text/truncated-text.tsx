import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/tooltip';
import type { TruncatedTextProps } from './types';

export function TruncatedText({
  maxLength,
  showTooltip = false,
  tabIndex,
  text,
  ...props
}: Readonly<TruncatedTextProps>) {
  const isTruncated = text.length > maxLength;
  const displayedText = isTruncated ? `${text.slice(0, maxLength)}…` : text;

  const content = (
    <span
      tabIndex={isTruncated && showTooltip ? (tabIndex ?? 0) : tabIndex}
      {...props}
    >
      {displayedText}
    </span>
  );

  if (!isTruncated || !showTooltip) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
