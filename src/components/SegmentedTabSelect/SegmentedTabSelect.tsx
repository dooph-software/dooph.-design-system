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

/**
 * Supported SegmentedTabSelect wrapper variants:
 *
 * | variant            | shell | active-tab style | item size |
 * |--------------------|-------|------------------|-----------|
 * | ghost              | –     | ghost            | default   |
 * | ghost-small        | –     | ghost            | default   |
 * | secondary          | ✓     | ghost            | default   |
 * | secondary-small    | ✓     | ghost            | default   |
 * | primary            | ✓     | primary          | default   |
 * | primary-small      | ✓     | primary          | default   |
 */
// SegmentedVariant (+ its type) lives in ./constants (server-safe), re-exported
// via index.ts; imported here for internal variant resolution.
import { SegmentedVariant } from './constants';

export interface SegmentedTabSelectProps
  extends ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: SegmentedVariant;
}

const SHELL_VARIANTS: SegmentedVariant[] = [
  SegmentedVariant.secondary,
  SegmentedVariant.secondarySmall,
  SegmentedVariant.primary,
  SegmentedVariant.primarySmall,
];

const SMALL_VARIANTS: SegmentedVariant[] = [
  SegmentedVariant.ghostSmall,
  SegmentedVariant.secondarySmall,
  SegmentedVariant.primarySmall,
];

const PRIMARY_ACTIVE_VARIANTS: SegmentedVariant[] = [
  SegmentedVariant.primary,
  SegmentedVariant.primarySmall,
];

const SegmentedTabSelect = forwardRef<
  ComponentRef<typeof TabsPrimitive.Root>,
  SegmentedTabSelectProps
>(({ className, variant = SegmentedVariant.secondary, children, ...props }, ref) => {
  const hasShell = SHELL_VARIANTS.includes(variant);
  const isSmall = SMALL_VARIANTS.includes(variant);
  const isPrimary = PRIMARY_ACTIVE_VARIANTS.includes(variant);

  return (
    <SegmentedTabContext.Provider
      value={{
        tabVariant: isPrimary ? TabVariant.primary : TabVariant.ghost,
        itemSize: TabSize.default,
      }}
    >
      <TabsPrimitive.Root ref={ref} {...props}>
        <TabsList
          className={cn(
            hasShell &&
              'rounded-soft border border-solid border-border bg-secondary p-1.5',
            isSmall && hasShell && 'gap-1',
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
