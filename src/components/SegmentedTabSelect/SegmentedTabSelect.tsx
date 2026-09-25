"use client";

import {
  createContext,
  forwardRef,
  useContext,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { TabsList, TabsTrigger, type TabsTriggerProps } from '../Tabs/Tabs';
import { TabSize, TabVariant } from '../Tabs/constants';
import { cn } from '../../utils/cn';

/**
 * Context that SegmentedTabSelect passes down to SegmentedTabItem,
 * allowing the wrapper to control the visual variant of all items.
 */
const SegmentedTabContext = createContext<{
  tabVariant?: TabVariant;
  itemSize?: TabSize;
}>({});

// SegmentedVariant/SegmentedSize (+ their types) live in ./constants
// (server-safe), re-exported via index.ts; imported here for internal
// variant/size resolution. See constants.ts for the Figma Tab Select
// variant × size table.
import { SegmentedSize, SegmentedVariant } from './constants';

export interface SegmentedTabSelectProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: SegmentedVariant;
  size?: SegmentedSize;
}

const ITEM_SIZE: Record<SegmentedSize, TabSize> = {
  container: TabSize.micro,
  'container-icon': TabSize.iconMicro,
  standard: TabSize.default,
  icon: TabSize.icon,
};

const SHELL_SIZES: SegmentedSize[] = [
  SegmentedSize.container,
  SegmentedSize.containerIcon,
];

const SegmentedTabSelect = forwardRef<
  ComponentRef<typeof TabsPrimitive.Root>,
  SegmentedTabSelectProps
>(({ className, variant = SegmentedVariant.primary, size = SegmentedSize.container, children, ...props }, ref) => {
  const hasShell = SHELL_SIZES.includes(size);

  return (
    <SegmentedTabContext.Provider
      value={{
        tabVariant: variant === SegmentedVariant.primary ? TabVariant.primary : TabVariant.ghost,
        itemSize: ITEM_SIZE[size],
      }}
    >
      <TabsPrimitive.Root ref={ref} {...props}>
        <TabsList
          className={cn(
            'gap-xxs',
            hasShell &&
              // 28px items + xxs inset + 1px border = 38px; outer radius is
              // radius-mini + xxs so it stays concentric with the items.
              'h-button p-xxs border border-solid border-border-primary bg-surface-primary ds-radius-mini-outset-xxs',
            className
          )}
        >
          {children}
        </TabsList>
      </TabsPrimitive.Root>
    </SegmentedTabContext.Provider>
  );
});
SegmentedTabSelect.displayName = 'SegmentedTabSelect';

/**
 * A tab item for use inside SegmentedTabSelect.
 * Inherits variant and size from the parent unless overridden explicitly.
 */
export interface SegmentedTabItemProps extends TabsTriggerProps {}

const SegmentedTabItem = forwardRef<
  ComponentRef<typeof TabsPrimitive.Trigger>,
  SegmentedTabItemProps
>(({ variant, size, ...props }, ref) => {
  const ctx = useContext(SegmentedTabContext);
  return (
    <TabsTrigger
      ref={ref}
      variant={variant ?? ctx.tabVariant ?? TabVariant.ghost}
      size={size ?? ctx.itemSize ?? TabSize.default}
      {...props}
    />
  );
});
SegmentedTabItem.displayName = 'SegmentedTabItem';

export { SegmentedTabSelect, SegmentedTabItem };
