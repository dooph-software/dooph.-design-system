/*
 * DropdownMenuSearch — slim search row for complex dropdown compositions.
 *
 * ## behavior
 * - Renders icon + native input + optional Esc hotkey; no bordered chrome
 *   (unlike its twin SearchBox — apply row fixes to both). Compose above a
 *   separator inside DropdownMenuContent.
 * - Forwards ref to the input. Stops keydown propagation so Radix typeahead
 *   does not steal keystrokes while typing.
 * - `className` styles the row `<div>`; `ref`, `style` and every other prop
 *   land on the `<input>`.
 * - Not keyboard-reachable inside DropdownMenuContent: Radix prevents Tab
 *   there and moves focus only among its own items, and this input stops
 *   keydown propagation, so ArrowDown never reaches the menu. As with
 *   DropdownMenuPlainItem, consumers must give keyboard users another path —
 *   filter from the trigger (TypeableDropdownTrigger) or search outside the menu.
 *
 * ## constraints
 * - Do not mount this inside DropdownMenuContent by default — consumers opt
 *   in; a menu that never asked for search would grow one.
 * - Keep typography on the input via `text-style-button`; do not introduce bare
 *   labeled HTML text nodes for the placeholder (placeholder attr is fine) —
 *   a bare text node escapes the text-style system.
 */
"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";
import { cn } from "../../utils/cn";
import { HotkeyIndicator } from "../HotkeyIndicator/HotkeyIndicator";
import { HotkeyIndicatorVariant } from "../HotkeyIndicator/constants";
import { SearchIcon, IconSize } from "../Icons";

export interface DropdownMenuSearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Shortcut keys shown on the trailing edge. Defaults to Esc. */
  shortcut?: string[];
  /** Whether the hotkey indicator is shown. Defaults to true when shortcut is set. */
  showShortcut?: boolean;
}

/**
 * Slim search row for complex dropdown compositions (opt-in; place above a
 * separator inside DropdownMenuContent).
 *
 * Keyboard limit: inside a Radix menu this input cannot be reached with Tab
 * or the arrow keys, and ArrowDown from it does not move into the items.
 * Provide a keyboard path too — filter from the trigger
 * (`TypeableDropdownTrigger`) or put the search outside the menu.
 */
const DropdownMenuSearch = forwardRef<HTMLInputElement, DropdownMenuSearchProps>(
  (
    {
      className,
      shortcut = ["Esc"],
      showShortcut = !!shortcut,
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
          "flex ds-min-w-menu-complex items-center gap-sm",
          "ds-px-ui-rg ds-py-ui-xxs",
          className,
        )}
      >
        <SearchIcon
          size={IconSize.md}
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
            variant={HotkeyIndicatorVariant.menu}
            className="shrink-0"
          />
        ) : null}
      </div>
    );
  },
);
DropdownMenuSearch.displayName = "DropdownMenuSearch";

export { DropdownMenuSearch };
