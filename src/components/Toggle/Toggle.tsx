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
 * - That whole rule lives in `useNeverClearedValue` below, which
 *   FancyToggleSwitch also calls. It is the one copy: change it
 *   here and both rows change together. Exported for that internal use only;
 *   index.ts does not re-export it.
 *
 * ## constraints
 * - Keep Radix fully controlled here — passing `defaultValue` through would let
 *   Radix's own state clear itself regardless of the callback.
 * - `useNeverClearedValue` lives in this module (not its own file) because
 *   this module is already `"use client"`; a separate hook module would need
 *   the directive too and add a client module to the package.
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
import { ButtonText } from "../Text";

// ToggleVariant / ToggleSize (+ their types) live in ./constants (server-safe),
// re-exported via index.ts; imported here for internal variant/size resolution.
import { ToggleSize, ToggleVariant } from "./constants";
import { toggleOptionVariants, type ToggleOptionSize } from "./toggleOption";

/** Switch size → Toggle Option size. Figma's switch "Icon Small" is the micro icon option. */
const OPTION_SIZE: Record<ToggleSize, ToggleOptionSize> = {
  standard: "standard",
  sm: "sm",
  icon: "icon",
  "icon-micro": "icon-micro",
};

/**
 * The single-select "never cleared" rule shared by ToggleSwitch and
 * FancyToggleSwitch (single mode). Feed the result straight to a Radix
 * ToggleGroup `type="single"` as `value` / `onValueChange`: Radix is always
 * controlled, and its "" (the active item clicked again) is dropped before it
 * reaches internal state or the consumer's callback.
 */
export function useNeverClearedValue({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? "",
  );
  const isControlled = value !== undefined;

  const handleValueChange = (next: string) => {
    // Radix reports "" when the active item is clicked again — ignore it.
    if (next === "") return;
    if (!isControlled) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return {
    value: isControlled ? value : uncontrolledValue,
    onValueChange: handleValueChange,
  };
}

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
    const selection = useNeverClearedValue({
      value,
      defaultValue,
      onValueChange,
    });

    return (
      <TogglePresentationContext.Provider value={{ variant, size }}>
        <ToggleGroup.Root
          ref={ref}
          type="single"
          value={selection.value}
          onValueChange={selection.onValueChange}
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
  const resolvedSize = size ?? presentation.size ?? ToggleSize.standard;

  return (
    <ButtonText
      as={ToggleGroup.Item}
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
