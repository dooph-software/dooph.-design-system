/*
 * DropdownCaret — the shape-backed caret at the end of a dropdown trigger.
 *
 * ## behavior
 * - A MorphRotationShape (embedded mode) behind a 14px chevron. Closed shows
 *   the variant's closed shape, open morphs to its open shape and flips the
 *   chevron 180°, and hover leans --ui-caret-nudge (by default
 *   --ui-shape-morph-nudge) toward the other shape in either state.
 * - State comes from the nearest `.ds-dropdown-caret-host` ancestor — the
 *   trigger root — via CSS: [data-state="open"], :hover, and
 *   :disabled / [aria-disabled="true"] / [data-disabled]. The trigger passes
 *   no props; a custom trigger opts in by adding the host class.
 * - By default the root is a square the trigger's height, centred on itself;
 *   the frame inside is height-button minus spacing-md (26px at defaults). The
 *   gaps that leaves are a result, not a spec, and they absorb the rotation
 *   spill.
 * - The shape and the hover nudge are EXPRESSIVE DETAILS, read from the
 *   expression tokens --ui-caret-shape-scale and --ui-caret-nudge through the
 *   .ds-expr-caret-shape / .ds-expr-caret-nudge helpers on the root. Under
 *   [data-ds-expression="practical"] both are 0: no shape, no frame, no lean,
 *   and the root shrinks to a plain chevron in the trigger's text colour with
 *   a trailing inset matching the host's ds-pl-ui-md.
 *
 * ## constraints
 * - The root's -my-px -mr-px pulls it over the host's 1px border so the
 *   square spans the trigger's full outer height, as in Figma (where borders
 *   are inside the frame). A host without a 1px border will misalign.
 * - Colours live in the .ds-dropdown-caret CSS, including the deliberate
 *   non-obvious token choices; do not move them into props or classes here —
 *   a prop or class bypasses the CSS's light/dark token choices.
 * - No state props and no listeners (Rule 7): hosts drive it through CSS only
 *   — a listener on the host breaks when the host is a consumer's custom trigger.
 * - The shape and the nudge must stay neutralisable by the practical preset:
 *   they are read only from --ui-caret-* via the .ds-expr-caret-* helpers, and
 *   nothing here (no inline style, no className, no prop) may set those tokens
 *   or size the root/frame another way — that would let a practical product
 *   still show the signature shape, or leave an empty frame beside the chevron.
 */
import { cn } from "../../utils/cn";
import { ChevronDownIcon, IconSize } from "../Icons";
import { MorphRotationShape, MorphRotationShapeMode } from "../MorphRotationShape";
import { Shapes } from "../Shapes";
import { DropdownCaretVariant } from "./constants";

/** [closed, open] per variant, as `Shapes` keys so this neutral module hands the
 * client MorphRotationShape only serialisable props. Module-level so the array
 * identity is stable. */
const CARET_SHAPES = {
  dropdown: [Shapes.squircle, Shapes.pixircle],
  typeable: [Shapes.clover, Shapes.eightLeafClover],
} satisfies Record<DropdownCaretVariant, Shapes[]>;

export interface DropdownCaretProps {
  variant?: DropdownCaretVariant;
  className?: string;
}

export const DropdownCaret = ({ variant = DropdownCaretVariant.dropdown, className }: DropdownCaretProps) => (
  <span
    aria-hidden
    className={cn(
      "ds-dropdown-caret ds-expr-caret-shape ds-expr-caret-nudge relative inline-flex h-button shrink-0 items-center justify-center -my-px -mr-px",
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
