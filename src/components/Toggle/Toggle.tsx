import * as ToggleGroup from "@radix-ui/react-toggle-group";
import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from "react";
import { cn } from "../../utils/cn";

/**
 * Dot-accessible toggle variant and size constants.
 * Usage: <TwoWayToggleItem variant={ToggleVariant.primary} size={ToggleSize.sm} />
 *
 * primary — selected item gets primary (dark) button fill; resting text is dark (text-text)
 * secondary — selected item gets ghost-active fill; resting text is ghost-fg
 */
export const ToggleVariant = {
  primary: "primary",
  secondary: "secondary",
} as const;
export type ToggleVariant = (typeof ToggleVariant)[keyof typeof ToggleVariant];

export const ToggleSize = {
  default: "default",
  sm: "sm",
} as const;
export type ToggleSize = (typeof ToggleSize)[keyof typeof ToggleSize];

const itemBase = [
  "inline-flex items-center justify-center whitespace-nowrap",
  "rounded-tight border border-transparent",
  "cursor-pointer select-none transition-all duration-100",
  "ds-focus-visible-ring",
  "ds-disabled-control",
];

const TogglePresentationContext = createContext<{
  variant?: ToggleVariant;
  size?: ToggleSize;
}>({});

export interface TwoWayToggleProps extends Omit<
  ComponentPropsWithoutRef<typeof ToggleGroup.Root>,
  "type" | "value" | "onValueChange" | "defaultValue"
> {
  variant?: ToggleVariant;
  size?: ToggleSize;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const TwoWayToggle = forwardRef<
  ComponentRef<typeof ToggleGroup.Root>,
  TwoWayToggleProps
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
  ) => (
    <TogglePresentationContext.Provider value={{ variant, size }}>
      <ToggleGroup.Root
        ref={ref}
        type="single"
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        className={cn("inline-flex items-center gap-1", className)}
        {...props}
      >
        {children}
      </ToggleGroup.Root>
    </TogglePresentationContext.Provider>
  ),
);
TwoWayToggle.displayName = "TwoWayToggle";

export interface TwoWayToggleItemProps extends ComponentPropsWithoutRef<
  typeof ToggleGroup.Item
> {
  variant?: ToggleVariant;
  size?: ToggleSize;
}

const TwoWayToggleItem = forwardRef<
  ComponentRef<typeof ToggleGroup.Item>,
  TwoWayToggleItemProps
>(({ className, variant, size, ...props }, ref) => {
  const presentation = useContext(TogglePresentationContext);
  const resolvedVariant = variant ?? presentation.variant ?? ToggleVariant.primary;
  const resolvedSize = size ?? presentation.size ?? ToggleSize.default;

  return (
    <ToggleGroup.Item
      ref={ref}
      className={cn(
        ...itemBase,
        resolvedSize === "default" && "h-button px-4 text-style-button",
        resolvedSize === "sm" && "h-button-sm px-3 text-style-button",
        resolvedVariant === "primary" && [
          "text-text hover:bg-ghost-hover",
          "data-[state=on]:bg-primary data-[state=on]:text-primary-fg",
          "data-[state=on]:border-primary",
        ],
        resolvedVariant === "secondary" && [
          "text-ghost-fg hover:bg-ghost-hover hover:text-ghost-fg-active",
          "data-[state=on]:bg-ghost-active data-[state=on]:text-ghost-fg-active",
        ],
        className,
      )}
      {...props}
    />
  );
});
TwoWayToggleItem.displayName = "TwoWayToggleItem";

export { TwoWayToggle, TwoWayToggleItem };
