import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface OutlineSectionProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * A double-border container shell for composing surface-level content.
 * Outer ring: dashed/thin border. Inner card: bg-secondary surface with shadow.
 * Use as a composable slot — place any content as children.
 *
 * @example
 * <OutlineSection>
 *   <SegmentedTabSelect>...</SegmentedTabSelect>
 * </OutlineSection>
 */
const OutlineSection = forwardRef<HTMLDivElement, OutlineSectionProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex flex-col items-center justify-center',
        'border border-solid border-border rounded-[28px]',
        'ds-p-ui-xs',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'bg-secondary border border-solid border-border',
          'rounded-soft shadow-menu',
          'ds-p-ui-xs',
          'inline-flex items-center justify-center',
        )}
      >
        {children}
      </div>
    </div>
  )
);
OutlineSection.displayName = 'OutlineSection';

export { OutlineSection };
