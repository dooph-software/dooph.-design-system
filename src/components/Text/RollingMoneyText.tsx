/*
 * RollingMoneyText — per-digit 2D roll for US-formatted money strings on change.
 *
 * ## behavior
 * - Accepts a children string (`$1,234.56`). Digits animate with a snappy
 *   vertical translate when the string changes; `$`, `,`, and `.` update
 *   without a roll.
 * - `smallCents` splits on the last `.` and renders the cents via the required
 *   `smallCentsComponent` (e.g. LabelText), top-right and also rolling.
 * - Digit direction compares old vs new digit (cash-register feel). Duration /
 *   stagger come from `--ui-rolling-money-*`. Reduced motion → instant swap.
 *
 * ## constraints
 * - US format only (`.` decimal, `,` thousands). Do not localize separators.
 * - This is a wrapper like RollChangeText — inherit typography from a parent
 *   role text; do not invent a flashy 3D / blur treatment.
 * - When `smallCents` is true, `smallCentsComponent` is required.
 */
"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export interface RollingMoneyTextProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: string;
  /** When true, split on the last `.` and render cents via `smallCentsComponent`. */
  smallCents?: boolean;
  /** Required when `smallCents` is true — e.g. `LabelText`. */
  smallCentsComponent?: ComponentType<{
    children?: ReactNode;
    className?: string;
  }>;
}

type DigitCell = {
  char: string;
  prev: string;
  dir: 1 | -1;
  animating: boolean;
};

const isDigit = (c: string) => c >= "0" && c <= "9";

function buildCells(next: string, prev: string | undefined): DigitCell[] {
  const prevChars = prev ?? next;
  const len = Math.max(next.length, prevChars.length);
  const cells: DigitCell[] = [];
  for (let i = 0; i < len; i++) {
    const n = next[i] ?? "";
    const p = prevChars[i] ?? n;
    if (!n) continue;
    const bothDigits = isDigit(n) && isDigit(p);
    const changed = n !== p;
    let dir: 1 | -1 = 1;
    if (bothDigits && changed) {
      dir = Number(n) >= Number(p) ? 1 : -1;
    }
    cells.push({
      char: n,
      prev: p,
      dir,
      animating: Boolean(prev !== undefined && changed && bothDigits),
    });
  }
  return cells;
}

function RollingStrip({
  cells,
  className,
}: {
  cells: DigitCell[];
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-baseline", className)}>
      {cells.map((cell, i) => {
        if (!isDigit(cell.char)) {
          return (
            <span key={`s-${i}-${cell.char}`} className="inline-block">
              {cell.char}
            </span>
          );
        }
        return (
          <span
            key={`d-${i}`}
            className="ds-rolling-money-digit"
            style={
              {
                "--ds-roll-dir": cell.dir,
                "--ds-rolling-money-delay": `calc(${i} * var(--ui-rolling-money-stagger))`,
              } as CSSProperties
            }
          >
            {cell.animating ? (
              <>
                <span
                  aria-hidden
                  className="ds-rolling-money-out absolute inset-0 flex items-center justify-center"
                >
                  {cell.prev}
                </span>
                <span className="ds-rolling-money-in relative inline-block">
                  {cell.char}
                </span>
              </>
            ) : (
              <span className="relative inline-block">{cell.char}</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

const RollingMoneyText = forwardRef<HTMLSpanElement, RollingMoneyTextProps>(
  (
    {
      children,
      smallCents = false,
      smallCentsComponent: SmallCents,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const value = typeof children === "string" ? children : String(children);
    const prevRef = useRef<string | undefined>(undefined);
    const [cells, setCells] = useState(() => buildCells(value, undefined));
    const [centsCells, setCentsCells] = useState<DigitCell[] | null>(null);

    if (smallCents && !SmallCents) {
      throw new Error(
        "RollingMoneyText: `smallCentsComponent` is required when `smallCents` is true.",
      );
    }

    useEffect(() => {
      const prev = prevRef.current;
      if (smallCents) {
        const dot = value.lastIndexOf(".");
        const dollars = dot === -1 ? value : value.slice(0, dot);
        const cents = dot === -1 ? "" : value.slice(dot + 1);
        const prevDot = prev?.lastIndexOf(".") ?? -1;
        const prevDollars =
          prev === undefined
            ? undefined
            : prevDot === -1
              ? prev
              : prev.slice(0, prevDot);
        const prevCents =
          prev === undefined
            ? undefined
            : prevDot === -1
              ? ""
              : prev.slice(prevDot + 1);
        setCells(buildCells(dollars, prevDollars));
        setCentsCells(buildCells(cents, prevCents));
      } else {
        setCells(buildCells(value, prev));
        setCentsCells(null);
      }
      prevRef.current = value;
    }, [value, smallCents]);

    return (
      <span
        ref={ref}
        className={cn("inline-flex items-start", className)}
        style={style}
        {...props}
      >
        <RollingStrip cells={cells} />
        {smallCents && SmallCents && centsCells ? (
          <SmallCents className="ml-[0.15em] translate-y-[-0.15em] leading-none">
            <RollingStrip cells={centsCells} />
          </SmallCents>
        ) : null}
      </span>
    );
  },
);
RollingMoneyText.displayName = "RollingMoneyText";

export { RollingMoneyText };
