import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { HotkeyIndicatorVariant } from './constants';

export interface HotkeyIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  keys: string[];
  pressed?: boolean;
  /** `menu` is the chip on a menu row; `pressed` applies to both. */
  variant?: HotkeyIndicatorVariant;
}

const HotkeyIndicator = forwardRef<HTMLSpanElement, HotkeyIndicatorProps>(
  function HotkeyIndicator(
    {
      keys,
      pressed = false,
      variant = HotkeyIndicatorVariant.default,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <span
        ref={ref}
        data-pressed={pressed || undefined}
        className={cn('group/hotkey inline-flex items-center gap-xxs', className)}
        {...props}
      >
        {keys.map((key, i) => (
          <kbd
            key={i}
            className={cn(
              'inline-flex items-center justify-center',
              'rounded-tight border',
              'text-style-label',
              'ds-motion-state',
              'ds-px-ui-sm ds-py-ui-xxs',
              keys.length === 1 && 'ds-min-size-kbd',
              variant === HotkeyIndicatorVariant.menu
                ? 'h-6 min-h-6 text-text-tertiary'
                : 'text-ghost-fg',
              variant === HotkeyIndicatorVariant.menu
                ? 'bg-secondary-hover border-secondary-border-hover'
                : 'bg-surface-page border-border-primary',
              // `pressed` is read from the root's data-pressed (both variants).
              'group-data-[pressed]/hotkey:bg-ghost-active group-data-[pressed]/hotkey:border-border-primary'
            )}
          >
            {key}
          </kbd>
        ))}
      </span>
    );
  },
);
HotkeyIndicator.displayName = "HotkeyIndicator";

export { HotkeyIndicator };
