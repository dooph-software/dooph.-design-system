/*
 * DropdownCaret — the shape-backed caret at the end of a dropdown trigger.
 *
 * ## behavior
 * - A MorphRotationShape (embedded mode) behind a 14px chevron. Closed shows
 *   the variant's closed shape, open morphs to its open shape and flips the
 *   chevron 180°, and hover leans --ui-shape-morph-nudge toward the other
 *   shape in either state.
 * - State comes from the nearest `.ds-dropdown-caret-host` ancestor — the
 *   trigger root — via CSS: [data-state="open"], :hover, and
 *   :disabled / [aria-disabled="true"] / [data-disabled]. The trigger passes
 *   no props; a custom trigger opts in by adding the host class.
 * - The root is a square the trigger's height, centred on itself; the frame
 *   inside is height-button minus spacing-rg (26px at defaults). The gaps that
 *   leaves are a result, not a spec, and they absorb the rotation spill.
 *
 * ## constraints
 * - The root's -my-px -mr-px pulls it over the host's 1px border so the
 *   square spans the trigger's full outer height, as in Figma (where borders
 *   are inside the frame). A host without a 1px border will misalign.
 * - Colours live in the .ds-dropdown-caret CSS, including the deliberate
 *   non-obvious token choices; do not move them into props or classes here.
 * - No state props and no listeners (Rule 7): hosts drive it through CSS only.
 */
import type { ComponentType } from "react";
import { cn } from "../../utils/cn";
import { ChevronDownIcon, IconSize } from "../Icons";
import { MorphRotationShape, MorphRotationShapeMode } from "../MorphRotationShape";
import { CloverShape, PixircleShape, PuffShape, SquircleShape } from "../Shapes";
import type { ShapeProps } from "../Shapes/BaseShape";
import { DropdownCaretVariant } from "./constants";

/** [closed, open] per variant. Module-level so the array identity is stable. */
const CARET_SHAPES = {
  dropdown: [SquircleShape, PixircleShape],
  typeable: [CloverShape, PuffShape],
} satisfies Record<DropdownCaretVariant, ComponentType<ShapeProps>[]>;

export interface DropdownCaretProps {
  variant?: DropdownCaretVariant;
  className?: string;
}

export const DropdownCaret = ({ variant = DropdownCaretVariant.dropdown, className }: DropdownCaretProps) => (
  <span
    aria-hidden
    className={cn(
      "ds-dropdown-caret relative inline-flex size-button shrink-0 items-center justify-center -my-px -mr-px",
      className,
    )}
  >
    <span className="ds-dropdown-caret-frame relative inline-flex items-center justify-center">
      <MorphRotationShape
        mode={MorphRotationShapeMode.embedded}
        shapes={CARET_SHAPES[variant]}
        restingAngle={0}
        className="absolute inset-0"
      />
      <ChevronDownIcon size={IconSize.rg} className="ds-dropdown-caret-chevron relative" />
    </span>
  </span>
);
