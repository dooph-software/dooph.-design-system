"use client";

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { HotkeyIndicator } from '../HotkeyIndicator/HotkeyIndicator';

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
 *
 * @example
 * <SearchBox placeholder="Search..." shortcut={['⌘', 'K']} />
 */
const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ className, shortcut, showShortcut = !!shortcut, placeholder = 'Search', ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center gap-2',
          'bg-secondary border border-solid border-border',
          'rounded-soft',
          'ds-pl-ui-md ds-pr-ui-rg ds-py-ui-rg',
          'min-w-[324px]',
          'transition-all duration-100',
          'hover:border-border-hover',
          'focus-within:border-border-focus ds-focus-within-ring',
          className
        )}
      >
        {/* Search icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          focusable="false"
          className="shrink-0 text-text-tertiary"
        >
          <circle
            cx="7"
            cy="7"
            r="4.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10.5 10.5L13 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Native input */}
        <input
          ref={ref}
          placeholder={placeholder}
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none',
            'text-style-button text-text placeholder:text-text-tertiary',
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
