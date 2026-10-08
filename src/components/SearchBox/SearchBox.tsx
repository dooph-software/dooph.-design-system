import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { ButtonText } from '../Text';
import { HotkeyIndicator } from '../HotkeyIndicator/HotkeyIndicator';
import { IconSize, SearchIcon } from '../Icons';

export interface SearchBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Keyboard shortcut keys displayed on the right. E.g. ['⌘', 'K'] or ['Ctrl', 'k']. */
  shortcut?: string[];
  /** Whether the hotkey indicator is shown. Defaults to true when shortcut is provided. */
  showShortcut?: boolean;
}

/**
 * A search input field styled per the design system.
 * Larger corner radius (rounded-soft) and leading search icon distinguish it from Input.
 * Accepts an optional keyboard shortcut indicator on the trailing edge.
 * Twin of `DropdownMenuSearch` (same icon + input + hotkey row, no menu): apply row fixes to both.
 * `className` styles the bordered field `<div>`; `ref`, `style` and every other prop go to the `<input>`.
 *
 * @example
 * <SearchBox placeholder="Search..." shortcut={['⌘', 'K']} />
 */
const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ className, shortcut, showShortcut = !!shortcut, placeholder = 'Search', disabled, ...props }, ref) => {
    return (
      <div
        data-disabled={disabled ? '' : undefined}
        className={cn(
          'flex items-center gap-sm',
          'bg-secondary border border-solid border-border-primary',
          'rounded-soft',
          'ds-pl-ui-lg ds-pr-ui-md ds-py-ui-md',
          'ds-min-w-search-box',
          'ds-motion-state',
          '[&:not([data-disabled])]:hover:border-input-border-hover',
          'focus-within:border-input-border-focus ds-focus-within-ring',
          'ds-radix-data-disabled data-[disabled]:bg-secondary-disabled data-[disabled]:border-secondary-border-disabled',
          className
        )}
      >
        {/* Search icon — the DS glyph, the same one DropdownMenuSearch draws */}
        <SearchIcon size={IconSize.md} className="shrink-0 text-text-tertiary" />

        {/* Native input */}
        <ButtonText
          as="input"
          ref={ref}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none',
            'text-text placeholder:text-text-tertiary',
          )}
          {...props}
        />

        {/* Keyboard shortcut hint */}
        {showShortcut && shortcut && shortcut.length > 0 && (
          <HotkeyIndicator keys={shortcut} className="shrink-0" />
        )}
      </div>
    );
  }
);

SearchBox.displayName = 'SearchBox';

export { SearchBox };
