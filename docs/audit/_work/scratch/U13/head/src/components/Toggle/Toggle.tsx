"use client";

/*
 * ToggleSwitch — Figma "Toggle Switch": a single-select row of Toggle Options
 * (two or more). Renamed from TwoWayToggle / TwoWayToggleItem (BREAKING, major).
 *
 * ## behavior
 * - Selection can never be cleared by the user. Radix ToggleGroup type="single"
 *   deselects the active item on a second click (value ""); the root always
 *   hands Radix a controlled value and drops that empty change, so neither
 *   internal state nor the consumer's onValueChange ever sees it.
 * - Controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`)
 *   both work; a controlled `value` always wins.
 *
 * ## constraints
 * - Keep Radix fully controlled here — passing `defaultValue` through would let
 *   Radix's own state clear itself regardless of the callback.
 */

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import {
  createContext,
  forwardRef,
  useContext,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";

// ToggleVariant / ToggleSize (+ their types) live in ./constants (server-safe),
// re-exported via index.ts; imported here for internal variant/size resolution.
import { ToggleSize, ToggleVariant } from "./constants";
import { toggleOptionVariants, type ToggleOptionSize } from "./toggleOption";

/** Switch size → Toggle Option size. Figma's switch "Icon Small" is the micro icon option. */
const OPTION_SIZE: Record<ToggleSize, ToggleOptionSize> = {
  default: "default",
  sm: "sm",
  icon: "icon",
  "icon-sm": "icon-micro",
};

const TogglePresentationContext = createContext<{
  variant?: ToggleVariant;
  size?: ToggleSize;
}>({});

export interface ToggleSwitchProps extends Omit<
  ComponentPropsWithoutRef<typeof ToggleGroup.Root>,
  "type" | "value" | "onValueChange" | "defaultValue"
> {
  variant?: ToggleVariant;
  size?: ToggleSize;
  value?: string;
  defaultValue?: string;
  /** Never called with "" — the selected option cannot be toggled off. */
  onValueChange?: (value: string) => void;
}

const ToggleSwitch = forwardRef<
  ComponentRef<typeof ToggleGroup.Root>,
  ToggleSwitchProps
>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      variant,
      size,
      children,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(
      defaultValue ?? "",
    );
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : uncontrolledValue;

    const handleValueChange = (next: string) => {
      // Radix reports "" when the active item is clicked again — ignore it.
      if (next === "") return;
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    };

    return (
      <TogglePresentationContext.Provider value={{ variant, size }}>
        <ToggleGroup.Root
          ref={ref}
          type="single"
          value={currentValue}
          onValueChange={handleValueChange}
          // Figma Toggle Switch: xxs (4px) between options in every variant.
          className={cn("inline-flex items-center gap-xxs", className)}
          {...props}
        >
          {children}
        </ToggleGroup.Root>
      </TogglePresentationContext.Provider>
    );
  },
);
ToggleSwitch.displayName = "ToggleSwitch";

export interface ToggleSwitchItemProps extends ComponentPropsWithoutRef<
  typeof ToggleGroup.Item
> {
  variant?: ToggleVariant;
  size?: ToggleSize;
}

const ToggleSwitchItem = forwardRef<
  ComponentRef<typeof ToggleGroup.Item>,
  ToggleSwitchItemProps
>(({ className, variant, size, ...props }, ref) => {
  const presentation = useContext(TogglePresentationContext);
  const resolvedVariant = variant ?? presentation.variant ?? ToggleVariant.primary;
  const resolvedSize = size ?? presentation.size ?? ToggleSize.default;

  return (
    <ToggleGroup.Item
      ref={ref}
      className={cn(
        toggleOptionVariants({
          variant: resolvedVariant,
          size: OPTION_SIZE[resolvedSize],
        }),
        className,
      )}
      {...props}
    />
  );
});
ToggleSwitchItem.displayName = "ToggleSwitchItem";

export { ToggleSwitch, ToggleSwitchItem };
