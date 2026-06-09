import { Slot } from "@radix-ui/react-slot";
import {
  forwardRef,
  useCallback,
  useRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ElementType,
  type ForwardedRef,
  type MutableRefObject,
  type ReactElement,
  type RefCallback,
} from "react";
import { cn } from "../../utils/cn";

type OutlineButtonOwnProps = {
  asChild?: boolean;
  className?: string;
  /**
   * Swaps the inner button surface from secondary tokens to primary tokens —
   * useful when OutlineButton sits on a background where the secondary surface
   * would blend in. Mirrors the `themeInverse` pattern on Tooltip.
   */
  inverseTheme?: boolean;
  /**
   * When true the accent glow is always visible, regardless of hover state.
   * The orbs use their original bottom-anchored positions (no cursor tracking).
   * When false (default) the glow fades in on hover and the orbs freely track
   * the cursor around the interior of the button.
   */
  glowing?: boolean;
  /** Background color for the left / larger orb. Defaults to `var(--ui-accent-color)`. */
  glowColor1?: string;
  /** Background color for the right / smaller orb. Defaults to `var(--ui-accent-color)`. */
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
 * @example
 * <OutlineButton><SearchIcon /> Find anything</OutlineButton>
 *
 * @example
 * // Always-on glow:
 * <OutlineButton glowing glowColor1="#c084fc" glowColor2="#a78bfa">
 *   Find anything
 * </OutlineButton>
 */
const OutlineButtonBase = forwardRef<
  HTMLElement,
  OutlineButtonProps<ElementType>
>(
  (
    {
      className,
      asChild = false,
      inverseTheme = false,
      glowing = false,
      glowColor1,
      glowColor2,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = (asChild ? Slot : "button") as ElementType;

    // Internal ref for direct DOM mutations — keeps cursor tracking out of React state.
    const innerElRef = useRef<HTMLElement | null>(null);

    const composedRef = useCallback(
      (node: HTMLElement | null) => {
        innerElRef.current = node;
        if (typeof ref === "function") {
          (ref as RefCallback<HTMLElement>)(node);
        } else if (ref) {
          (ref as MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      [ref],
    );

    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
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
      [glowing],
    );

    const handleMouseLeave = useCallback(() => {
      if (glowing) return;
      const el = innerElRef.current;
      if (!el) return;
      // Reset to center so orbs drift back smoothly via CSS transition
      el.style.setProperty("--gx", "0.5");
      el.style.setProperty("--gy", "0.5");
    }, [glowing]);

    const color1 = glowColor1 ?? "var(--ui-accent-color)";
    const color2 = glowColor2 ?? "var(--ui-accent-color)";

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
          "border border-solid border-border rounded-[28px]",
          "ds-p-ui-xs",
          inverseTheme && "border-primary",
          className,
        )}
      >
        {/* Inner elevated button surface */}
        <Comp
          ref={composedRef as ForwardedRef<HTMLElement>}
          className={cn(
            "group relative overflow-hidden",
            "inline-flex items-center justify-center gap-2",
            "h-[54px] min-w-[160px] px-3",
            "border border-solid rounded-soft shadow-button",
            "text-style-button cursor-pointer select-none",
            "transition-all duration-150 ease-out",
            "ds-focus-visible-ring",
            "ds-disabled-state",
            inverseTheme
              ? "bg-primary border-primary text-primary-fg"
              : "bg-secondary border-border text-secondary-fg",
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          {glowing ? (
            /*
             * Controlled mode — bottom-anchored, always lit.
             * Orbs sit at the bottom of the frame exactly as they did before cursor
             * tracking was introduced. Opacity is set inline so it can be transitioned
             * if `glowing` flips at runtime.
             */
            <>
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute rounded-full",
                  "bottom-[-18px] left-[4%] w-[62%] h-[72%]",
                  disabledGlowClass,
                )}
                style={{
                  background: color1,
                  filter: "blur(18px)",
                  opacity: 0.38,
                  transition: "opacity 0.36s ease-out",
                }}
              />
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute rounded-full",
                  "bottom-[-14px] right-[6%] w-[48%] h-[64%]",
                  disabledGlowClass,
                )}
                style={{
                  background: color2,
                  filter: "blur(24px)",
                  opacity: 0.22,
                  transition: "opacity 0.42s ease-out",
                }}
              />
            </>
          ) : (
            /*
             * Hover / cursor-tracking mode — "gutter rolling."
             *
             * Each orb is anchored at left:0, top:0 and translated so its CENTER
             * sits exactly at the cursor position inside the button:
             *
             *   translateX = gx * bw − 50%  (−50% centers the orb on that point)
             *
             * When the cursor is at any wall (gx=0 or gx=1), the orb center is ON
             * the wall — half the orb is clipped outside, the other half blooms in
             * from the edge. This is the "gutter" effect.
             *
             * Orb 2 tracks the diagonally opposite point (1−gx, 1−gy) so the two
             * colors always sit on opposite sides of the button, making them visually
             * distinct even when different glowColor props are supplied.
             *
             * overflow-hidden on the parent clips both orbs cleanly.
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
                  "pointer-events-none absolute rounded-full w-[62%] h-[72%]",
                  "opacity-0 group-hover:opacity-[0.38]",
                  disabledGlowClass,
                )}
                style={{
                  background: color1,
                  filter: "blur(20px)",
                  left: 0,
                  top: 0,
                  transform:
                    "translate(" +
                    "calc((var(--gx, 0.5) * 0.4 + 0.25) * var(--bw, 160px) - 50%)," +
                    "calc(var(--gy, 0.5) * var(--bh, 54px) - 50%)" +
                    ")",
                  transition:
                    "opacity 0.36s ease-out, transform 0.16s ease-out",
                }}
              />
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute rounded-full w-[48%] h-[64%]",
                  "opacity-0 group-hover:opacity-[0.22]",
                  disabledGlowClass,
                )}
                style={{
                  background: color2,
                  filter: "blur(26px)",
                  left: 0,
                  top: 0,
                  transform:
                    "translate(" +
                    "calc((var(--gx, 0.5) * 0.4 + 0.55) * var(--bw, 160px) - 50%)," +
                    "calc(var(--gy, 0.5) * var(--bh, 54px) - 50%)" +
                    ")",
                  transition:
                    "opacity 0.42s ease-out, transform 0.22s ease-out",
                }}
              />
            </>
          )}

          {/* Content sits above the blur layer */}
          <span className="relative z-10 inline-flex items-center gap-2">
            {children}
          </span>
        </Comp>
      </div>
    );
  },
);

OutlineButtonBase.displayName = "OutlineButton";

const OutlineButton = OutlineButtonBase as OutlineButtonComponent;

export { OutlineButton };
