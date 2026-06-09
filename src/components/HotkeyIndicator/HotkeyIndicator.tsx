import { type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface HotkeyIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  keys: string[];
  pressed?: boolean;
}

function HotkeyIndicator({ keys, pressed = false, className, ...props }: HotkeyIndicatorProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)} {...props}>
      {keys.map((key, i) => (
        <kbd
          key={i}
          className={cn(
            'inline-flex items-center justify-center',
            'rounded-tight border border-border',
            'text-style-label text-ghost-fg',
            'transition-colors duration-100',
            'ds-px-ui-xs ds-py-ui-xxs',
            keys.length === 1 && 'min-w-[23px] min-h-[23px]',
            pressed
              ? 'bg-ghost-active border-border'
              : 'bg-surface-page border-border'
          )}
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

export { HotkeyIndicator };
