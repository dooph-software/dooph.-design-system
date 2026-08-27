/*
 * DropdownMenuSearch — slim search row for complex dropdown compositions.
 *
 * ## behavior
 * - Renders icon + native input + optional Esc hotkey; no bordered chrome
 *   (unlike SearchBox). Compose above a separator inside DropdownMenuContent.
 * - Forwards ref to the input. Stops keydown propagation so Radix typeahead
 *   does not steal keystrokes while typing.
 *
 * ## constraints
 * - Do not mount this inside DropdownMenuContent by default — consumers opt in.
 * - Keep typography on the input via `text-style-button`; do not introduce bare
 *   labeled HTML text nodes for the placeholder (placeholder attr is fine).
 */
"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";
import { cn } from "../../utils/cn";
import { HotkeyIndicator } from "../HotkeyIndicator/HotkeyIndicator";
import { SearchIcon, IconSize } from "../Icons";

export interface DropdownMenuSearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Shortcut keys shown on the trailing edge. Defaults to Esc. */
  shortcut?: string[];
  /** Whether the hotkey indicator is shown. Defaults to true when shortcut is set. */
  showShortcut?: boolean;
}

const DropdownMenuSearch = forwardRef<HTMLInputElement, DropdownMenuSearchProps>(
  (
    {
      className,
      shortcut = ["Esc"],
      showShortcut = true,
      placeholder = "Search",
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      event.stopPropagation();
      onKeyDown?.(event);
    };

    return (
      <div
        className={cn(
          "flex min-w-[324px] items-center gap-xs",
          "ds-px-ui-sm ds-py-ui-xxs",
          className,
        )}
      >
        <SearchIcon
          size={IconSize.medium}
          className="shrink-0 text-text-tertiary"
          aria-hidden
        />
        <input
          ref={ref}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className={cn(
            "min-w-0 flex-1 bg-transparent outline-none",
            "text-style-button text-text placeholder:text-text-tertiary",
          )}
          {...props}
        />
        {showShortcut && shortcut.length > 0 ? (
          <HotkeyIndicator
            keys={shortcut}
            className="shrink-0 [&_kbd]:h-6 [&_kbd]:min-h-6 [&_kbd]:bg-secondary-hover [&_kbd]:border-secondary-border-hover [&_kbd]:text-text-tertiary"
          />
        ) : null}
      </div>
    );
  },
);
DropdownMenuSearch.displayName = "DropdownMenuSearch";

export { DropdownMenuSearch };
