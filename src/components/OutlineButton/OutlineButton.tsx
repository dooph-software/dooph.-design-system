"use client";

import { Slot, Slottable } from "@radix-ui/react-slot";
import {
  forwardRef,
  useCallback,
  useRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ElementType,
  type ForwardedRef,
  type ReactElement,
} from "react";
import { cn } from "../../utils/cn";
import { ButtonText } from "../Text";
import { useComposedRefs } from "../../utils/composeRefs";

type OutlineButtonOwnProps = {
  asChild?: boolean;
  className?: string;
  /**
   * Swaps the inner button surface from secondary tokens to primary tokens —
   * useful when OutlineButton sits on a background where the secondary surface
   * would blend in. Same flag as Tooltip's `themeInverse`.
   */
  themeInverse?: boolean;
  /**
   * When true the accent glow is always visible, regardless of hover state.
   * The orbs use their original bottom-anchored positions (no cursor tracking).
   * When false (default) the glow fades in on hover and the orbs freely track
   * the cursor around the interior of the button.
   */
  glowing?: boolean;
  /** Background color for the left / larger orb. Defaults to `var(--ui-prominent-color-alt)`. */
  glowColor1?: string;
  /** Background color for the right / smaller orb. Defaults to `var(--ui-prominent-color-alt)`. */
  glowColor2?: string;
};

export type OutlineButtonProps<TElement extends ElementType = "button"> =
  OutlineButtonOwnProps &
    Omit<ComponentPropsWithoutRef<TElement>, keyof OutlineButtonOwnProps>;

type OutlineButtonComponent = <TElement extends ElementType = "button">(
  props: OutlineButtonProps<TElement> & {
    ref?: ComponentPropsWithRef<TElement>["ref"];
  },
) => ReactElement | null;

/* Typed at the default element so the render body's bindings keep their
 * types; only the exported cast is polymorphic. */
/**
 * An outlined pill-shaped button with an inner elevated surface.
 *
 * In hover mode (default) the accent glow fades in on hover and the two orbs
 * loosely track the cursor around the button interior at different speeds.
 *
 * In controlled mode (`glowing`) the orbs sit at the bottom of the frame and
 * stay visible without any hover condition — useful for a persistent "lit" state
 * driven by application logic.
 *
 * `className` styles the outer pill frame `<div>`; `ref`, `style`, handlers and
 * every other prop go to the inner button (the slotted element under `asChild`).
 *
 * @example
 * <OutlineButton><SearchIcon /> Find anything</OutlineButton>
 *
 * @example
 * // Always-on glow:
 * <OutlineButton glowing glowColor1="#c084fc" glowColor2="#a78bfa">
 *   Find anything
 * </OutlineButton>
 */
const OutlineButtonBase = forwardRef<HTMLElement, OutlineButtonProps<"button">>(
  (
    {
      className,
      asChild = false,
      themeInverse = false,
      glowing = false,
      glowColor1,
      glowColor2,
      children,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const Comp = (asChild ? Slot : "button") as ElementType;

    // Internal ref for direct DOM mutations — keeps cursor tracking out of React state.
    const innerElRef = useRef<HTMLElement | null>(null);

    const composedRef = useComposedRefs<HTMLElement>(innerElRef, ref);

    // The consumer's mouse handlers are destructured out of `props` and run
    // first here; left in `...props` they would replace the glow tracking.
    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onMouseMove?.(event);
        if (glowing) return; // controlled mode — no cursor tracking needed
        const el = innerElRef.current;
        if (!el) return;
        const { left, top, width, height } = el.getBoundingClientRect();
        // 0→1 fraction; --bw/--bh give the orb transforms a px reference
        el.style.setProperty(
          "--gx",
          ((event.clientX - left) / width).toFixed(3),
        );
        el.style.setProperty(
          "--gy",
          ((event.clientY - top) / height).toFixed(3),
        );
        el.style.setProperty("--bw", `${width}px`);
        el.style.setProperty("--bh", `${height}px`);
      },
      [glowing, onMouseMove],
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onMouseLeave?.(event);
        if (glowing) return;
        const el = innerElRef.current;
        if (!el) return;
        // Reset to center so orbs drift back smoothly via CSS transition
        el.style.setProperty("--gx", "0.5");
        el.style.setProperty("--gy", "0.5");
      },
      [glowing, onMouseLeave],
    );

    const color1 = glowColor1 ?? "var(--ui-prominent-color-alt)";
    const color2 = glowColor2 ?? "var(--ui-prominent-color-alt)";

    // Shared classes that disable the glow when the button itself is disabled
    const disabledGlowClass = cn(
      "group-disabled:!opacity-0",
      'group-[&[aria-disabled="true"]]:!opacity-0',
    );

    return (
      /* Outer pill frame */
      <div
        className={cn(
          "inline-flex flex-col items-center justify-center",
          "border border-solid border-border-primary rounded-outline-frame",
          "ds-p-ui-sm",
          themeInverse && "border-primary",
          className,
        )}
      >
        {/* Inner elevated button surface */}
        <ButtonText
          as={Comp}
          ref={composedRef as ForwardedRef<HTMLElement>}
          className={cn(
            "group relative overflow-hidden",
            "inline-flex items-center justify-center gap-sm",
            "ds-size-outline-button px-md",
            "border border-solid rounded-soft shadow-button",
            "cursor-pointer select-none",
            "ds-motion-state",
            "ds-focus-visible-ring",
            "ds-disabled-state",
            themeInverse
              ? "bg-primary border-primary text-primary-fg"
              : "bg-secondary border-border-primary text-secondary-fg",
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          {glowing ? (
            /*
             * Controlled mode — bottom-anchored, always lit.
             * Orbs sit at the bottom of the frame exactly as they did before cursor
             * tracking was introduced. Placement, opacity and blur come from
             * the ds-outline-button-glow-* classes (--ui-outline-button-*);
             * only the consumer's colour is inline. The ds-outline-orb-* class
             * transitions opacity if `glowing` flips at runtime.
             */
            <>
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute rounded-full",
                  "ds-outline-button-glow-1",
                  "ds-outline-orb-1",
                  disabledGlowClass,
                )}
                style={{ background: color1 }}
              />
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute rounded-full",
                  "ds-outline-button-glow-2",
                  "ds-outline-orb-2",
                  disabledGlowClass,
                )}
                style={{ background: color2 }}
              />
            </>
          ) : (
            /*
             * Hover / cursor-tracking mode — "gutter rolling."
             *
             * Each orb is anchored at left:0, top:0 and translated so its CENTER
             * sits at a point derived from the cursor position (--gx/--gy, 0–1)
             * inside the button — the exact mapping is in the comment below. Near
             * a wall part of an orb is clipped outside and the rest blooms in from
             * the edge (the "gutter" effect). overflow-hidden on the parent clips
             * both orbs cleanly.
             */
            <>
              {/*
               * Both orbs track the cursor in the same direction but with a
               * constant 30% lateral offset between their centres — color1 is
               * always left of color2, the gap never collapses, and both colors
               * stay readable as distinct zones throughout the full cursor range.
               *
               * Orb 1 x-centre: (gx × 0.4 + 0.25) × bw  →  range 25 %–65 % of button
               * Orb 2 x-centre: (gx × 0.4 + 0.55) × bw  →  range 55 %–95 % of button
               * Separation stays constant at 0.30 × bw regardless of cursor position.
               */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute rounded-full",
                  "ds-outline-button-trail-1",
                  "ds-outline-orb-1",
                  disabledGlowClass,
                )}
                style={{
                  background: color1,
                  left: 0,
                  top: 0,
                  transform:
                    "translate(" +
                    "calc((var(--gx, 0.5) * 0.4 + 0.25) * var(--bw, var(--ui-min-w-outline-button)) - 50%)," +
                    "calc(var(--gy, 0.5) * var(--bh, var(--ui-height-outline-button)) - 50%)" +
                    ")",
                }}
              />
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute rounded-full",
                  "ds-outline-button-trail-2",
                  "ds-outline-orb-2",
                  disabledGlowClass,
                )}
                style={{
                  background: color2,
                  left: 0,
                  top: 0,
                  transform:
                    "translate(" +
                    "calc((var(--gx, 0.5) * 0.4 + 0.55) * var(--bw, var(--ui-min-w-outline-button)) - 50%)," +
                    "calc(var(--gy, 0.5) * var(--bh, var(--ui-height-outline-button)) - 50%)" +
                    ")",
                }}
              />
            </>
          )}

          {/* Content sits above the blur layer. Slottable marks the asChild
           * target, and the span wraps that element's own children, so the
           * label still layers above the orbs when slotted. */}
          <Slottable child={children}>
            {(child) => (
              <span className="relative z-10 inline-flex items-center gap-sm">
                {child}
              </span>
            )}
          </Slottable>
        </ButtonText>
      </div>
    );
  },
);

OutlineButtonBase.displayName = "OutlineButton";

const OutlineButton = OutlineButtonBase as OutlineButtonComponent;

export { OutlineButton };
