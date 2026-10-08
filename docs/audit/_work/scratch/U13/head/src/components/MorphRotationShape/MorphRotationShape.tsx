/*
 * MorphRotationShape — a DS shape that morphs into the next one while turning,
 * after Material 3 Expressive's LoadingIndicator.
 *
 * ## behavior
 * - `mode` picks what drives each step: `autoplay` (an internal CSS clock on
 *   --ui-shape-morph-interval), `controlled` (`activeIndex`), or `embedded`
 *   (an ancestor's CSS sets --ds-shape-morph-target).
 * - One registered number, --ds-shape-morph-step, is transitioned by CSS with
 *   the generated spring ease. Integer part = stop, fraction = morph progress.
 *   The ease overshoots, so values past a stop are real and are drawn as an
 *   exaggerated morph and turn, never clamped: that is the backspin.
 * - `controlled` moves forward one stop per `activeIndex` change and morphs
 *   directly to the new shape. In `autoplay`/`embedded` the stops are shape
 *   indices, so a target two away passes through the shape between, and a
 *   lower target plays the morph and turn in reverse.
 * - The drawn value is --ds-shape-morph-step (whole stops, spring ease) PLUS
 *   --ds-shape-morph-lean (a hover nudge, --ui-shape-morph-nudge-* ease). Two
 *   properties because a click while hovered and a hover while open end in the
 *   same final style; only separate transitions can give them different feels.
 *   Targets may therefore be fractional and rest there (e.g. 1.15).
 * - Fit: `autoplay` scales every shape to survive any rotation and re-centres
 *   on each frame's bounds (Compose processPath). `controlled`/`embedded` fill
 *   the box at the 24-unit viewBox scale about a FIXED centre, so at rest the
 *   shape is pixel-identical to the static Shapes component; rotation and
 *   overshoot then spill ~9% past the box, which frames reserve as padding.
 * - `restingAngle` derives each step's turn from the target shape's measured
 *   rotational symmetry so every rest pose lands on that angle.
 * - It fills the box it is given and sizes nothing itself: give it a size or
 *   an inset.
 *
 * ## constraints
 * - Motion belongs to CSS, geometry belongs here (architecture Rule 6).
 *   Durations and easing are --ui-shape-morph-* tokens, overridable per
 *   instance through `timing` (inline custom properties). Nothing in this file
 *   may hold a duration or an easing curve; the spring lives in
 *   scripts/shapeMorphSpring.mjs and reaches here only as the ease token.
 * - `d` and the transform are in JSX only for the FIRST render (so SSR output
 *   is right). After that React must never touch them, or a re-render mid-step
 *   snaps the shape.
 * - Sampling starts from this element's OWN transitionrun / animationstart /
 *   animationiteration events and stops when the value lands. Never listen on
 *   an ancestor (Rule 7): `embedded` works because the ancestor's state reaches
 *   this element through CSS inheritance, not a listener.
 * - The motion range comes from widenRange (floor/ceil of every target seen)
 *   and resets only on landing. Deriving the segment from floor(value) alone
 *   draws the wrong morph while overshooting past the far stop, and rounding
 *   the target would erase a resting nudge.
 * - onStepComplete fires only when landing on a whole stop, never for a lean.
 * - Changing `shapes` remounts the inner component (key), resetting to stop 0
 *   without animation.
 * - One getComputedStyle per frame per animating instance.
 */
"use client";

import {
  type ComponentPropsWithoutRef,
  type ComponentType,
  type CSSProperties,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../../utils/cn";
import type { ShapeProps } from "../Shapes/BaseShape";
import { getShapePath } from "../Shapes/shapePaths";
import { MorphRotationShapeMode } from "./constants";
import { Morph } from "./engine/morph";
import { toPathD } from "./engine/pathD";
import type { RoundedPolygon } from "./engine/polygon";
import { polygonFromSvgPath } from "./engine/svgPath";
import { rotationalSymmetry, stepTurn } from "./engine/symmetry";
import { frameTransform, rotationSafeScale, segmentAt, widenRange } from "./geometry";
import {
  type MorphRotationShapeAutoplayTiming,
  type MorphRotationShapeStepTiming,
  timingVars,
} from "./timing";

/** Turn per step, degrees. Geometry, so it may live here (Rule 6). M3: 90. */
const NOMINAL_TURN_DEG = 90;
/** Below this the transitioned value has landed. */
const EPSILON = 0.001;

type ShapeComponent = ComponentType<ShapeProps>;
type SpanProps = Omit<ComponentPropsWithoutRef<"span">, "children">;

type CommonProps = SpanProps & {
  /** DS shape components in play order, e.g. `[CloverShape, PuffShape]`. At least two. */
  shapes: ShapeComponent[];
};

export type MorphRotationShapeProps = CommonProps &
  (
    | {
        mode: typeof MorphRotationShapeMode.autoplay;
        timing?: MorphRotationShapeAutoplayTiming;
        activeIndex?: never;
        restingAngle?: never;
        onStepComplete?: never;
      }
    | {
        mode: typeof MorphRotationShapeMode.controlled;
        /** Index into `shapes`. Each change runs one step to that shape. */
        activeIndex: number;
        /** Land every step at this angle (degrees). */
        restingAngle?: number;
        /** Fires with the shape index a step landed on. */
        onStepComplete?: (shapeIndex: number) => void;
        timing?: MorphRotationShapeStepTiming;
      }
    | {
        mode: typeof MorphRotationShapeMode.embedded;
        restingAngle?: number;
        onStepComplete?: (shapeIndex: number) => void;
        timing?: MorphRotationShapeStepTiming;
        activeIndex?: never;
      }
  );

interface ShapeData {
  /** 24-unit viewBox scale, frame centre. Used by controlled/embedded. */
  frame: RoundedPolygon;
  /** Bounds-normalized, as Compose does for the loader. */
  loader: RoundedPolygon;
  symmetry: number;
}

const shapeCache = new Map<ShapeComponent, ShapeData>();
function shapeData(Component: ShapeComponent): ShapeData {
  let data = shapeCache.get(Component);
  if (!data) {
    const frame = polygonFromSvgPath(getShapePath(Component));
    data = { frame, loader: frame.normalized(), symmetry: rotationalSymmetry(frame) };
    shapeCache.set(Component, data);
  }
  return data;
}

const mod = (i: number, n: number) => ((i % n) + n) % n;

function assertProps(props: MorphRotationShapeProps) {
  if (!Object.values(MorphRotationShapeMode).includes(props.mode)) {
    throw new Error(`MorphRotationShape: unknown mode "${String(props.mode)}"`);
  }
  if (!Array.isArray(props.shapes) || props.shapes.length < 2) {
    throw new Error("MorphRotationShape: `shapes` needs at least two DS shape components");
  }
  if (props.mode === MorphRotationShapeMode.controlled && !Number.isInteger(props.activeIndex)) {
    throw new Error("MorphRotationShape: `controlled` mode requires an integer `activeIndex`");
  }
}

/** Changes only when the shapes array's elements (by identity) change. */
function useShapesKey(shapes: ShapeComponent[]): number {
  const ref = useRef({ shapes, key: 0 });
  const prev = ref.current.shapes;
  if (prev.length !== shapes.length || prev.some((s, i) => s !== shapes[i])) {
    ref.current = { shapes, key: ref.current.key + 1 };
  }
  return ref.current.key;
}

export const MorphRotationShape = (props: MorphRotationShapeProps) => {
  assertProps(props);
  const key = useShapesKey(props.shapes);
  return <MorphRotationShapeInner key={key} {...props} />;
};

const MorphRotationShapeInner = ({
  mode,
  shapes,
  timing,
  activeIndex,
  restingAngle,
  onStepComplete,
  className,
  style,
  ...spanProps
}: MorphRotationShapeProps) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const n = shapes.length;
  const isLoader = mode === MorphRotationShapeMode.autoplay;
  const isControlled = mode === MorphRotationShapeMode.controlled;
  // Keyed on shapes by the outer component, so these are stable for this instance.
  const data = useMemo(() => shapes.map(shapeData), [shapes]);
  const loaderScale = useMemo(() => (isLoader ? rotationSafeScale(data.map((d) => d.loader)) : null), [data, isLoader]);

  const onStepCompleteRef = useRef(onStepComplete);
  onStepCompleteRef.current = onStepComplete;

  // Controlled: one stop per activeIndex change; stops[k] = shape index at stop k.
  const initialIndex = isControlled ? mod(activeIndex ?? 0, n) : 0;
  const stopsRef = useRef<number[]>([initialIndex]);
  const [counter, setCounter] = useState(0);
  useLayoutEffect(() => {
    if (!isControlled) return;
    const idx = mod(activeIndex ?? 0, n);
    const stops = stopsRef.current;
    if (stops[stops.length - 1] === idx) return;
    stops.push(idx);
    setCounter(stops.length - 1);
  }, [isControlled, activeIndex, n]);

  const engine = useRef({
    angles: [restingAngle ?? 0],
    morphs: new Map<string, Morph>(),
    settled: 0,
    stop: 0,
    lo: 0,
    hi: 0,
    prev: 0,
    raf: 0,
    autoTarget: 0,
  }).current;

  const shapeAt = (k: number) =>
    isControlled ? stopsRef.current[Math.min(Math.max(k, 0), stopsRef.current.length - 1)] : mod(k, n);
  const polyOf = (i: number) => (isLoader ? data[i].loader : data[i].frame);
  const morphFor = (a: number, b: number) => {
    const id = `${a}>${b}`;
    let m = engine.morphs.get(id);
    if (!m) engine.morphs.set(id, (m = new Morph(polyOf(a), polyOf(b))));
    return m;
  };
  const angleAt = (k: number) => {
    const { angles } = engine;
    const stop = Math.max(0, k);
    while (angles.length <= stop) {
      const j = angles.length;
      const prev = angles[j - 1];
      const turn =
        restingAngle === undefined
          ? NOMINAL_TURN_DEG
          : stepTurn(prev, restingAngle, data[shapeAt(j)].symmetry, NOMINAL_TURN_DEG);
      angles.push(prev + turn);
    }
    return angles[stop];
  };

  const draw = (v: number) => {
    const { segment, t, atRest } = segmentAt(v, engine.lo, engine.hi);
    const cubics = atRest
      ? polyOf(shapeAt(segment)).cubics
      : morphFor(shapeAt(segment), shapeAt(segment + 1)).asCubics(t);
    const angle = atRest ? angleAt(segment) : angleAt(segment) + t * (angleAt(segment + 1) - angleAt(segment));
    pathRef.current?.setAttribute("d", toPathD(cubics, 100));
    gRef.current?.setAttribute("transform", frameTransform(cubics, angle, loaderScale));
  };

  // First render only (SSR-correct); the loop owns d/transform afterwards.
  const initial = useRef<{ d: string; transform: string } | null>(null);
  if (initial.current === null) {
    const cubics = polyOf(initialIndex).cubics;
    initial.current = {
      d: toPathD(cubics, 100),
      transform: frameTransform(cubics, restingAngle ?? 0, loaderScale),
    };
  }

  // Assigned every render so the loop always sees current closures.
  const startRef = useRef<() => void>(() => {});
  startRef.current = () => {
    if (engine.raf) return;
    const sample = () => {
      const span = spanRef.current;
      if (!span) {
        engine.raf = 0;
        return;
      }
      const cs = getComputedStyle(span);
      const num = (name: string) => Number.parseFloat(cs.getPropertyValue(name)) || 0;
      // Two transitioned numbers: whole stops (spring) + hover lean (gentle ease).
      const v = num("--ds-shape-morph-step") + num("--ds-shape-morph-lean");
      const target = num("--ds-shape-morph-target") + num("--ds-shape-morph-nudge");
      [engine.lo, engine.hi] = widenRange(engine.lo, engine.hi, engine.settled, target);
      draw(v);
      if (Math.abs(v - target) < EPSILON && Math.abs(v - engine.prev) < EPSILON) {
        const landedOnStop = Number.isInteger(target) && target !== engine.stop;
        if (Number.isInteger(target)) engine.stop = target;
        engine.settled = target;
        engine.lo = Math.floor(target);
        engine.hi = Math.ceil(target);
        engine.raf = 0;
        draw(target);
        // A hover lean is not a step: only whole stops report.
        if (landedOnStop) onStepCompleteRef.current?.(shapeAt(target));
        return;
      }
      engine.prev = v;
      engine.raf = requestAnimationFrame(sample);
    };
    engine.raf = requestAnimationFrame(sample);
  };

  useLayoutEffect(() => {
    const span = spanRef.current;
    if (!span) return;
    const onTransitionRun = (e: TransitionEvent) => {
      if (
        e.target === span &&
        (e.propertyName === "--ds-shape-morph-step" || e.propertyName === "--ds-shape-morph-lean")
      ) {
        startRef.current();
      }
    };
    const onClock = (e: AnimationEvent) => {
      if (e.target !== span || e.animationName !== "ds-shape-morph-clock") return;
      engine.autoTarget += 1;
      span.style.setProperty("--ds-shape-morph-target", String(engine.autoTarget));
      startRef.current();
    };
    span.addEventListener("transitionrun", onTransitionRun);
    if (isLoader) {
      span.addEventListener("animationstart", onClock);
      span.addEventListener("animationiteration", onClock);
    }
    // Embedded may mount with its ancestor already in the target state.
    startRef.current();
    return () => {
      span.removeEventListener("transitionrun", onTransitionRun);
      span.removeEventListener("animationstart", onClock);
      span.removeEventListener("animationiteration", onClock);
      if (engine.raf) cancelAnimationFrame(engine.raf);
      engine.raf = 0;
    };
  }, [engine, isLoader]);

  // Controlled: also start directly, in case transitionrun is not delivered.
  useLayoutEffect(() => {
    if (isControlled && counter > 0) startRef.current();
  }, [isControlled, counter]);

  const styleVars: Record<string, string | number> = { ...timingVars(timing) };
  if (isControlled) styleVars["--ds-shape-morph-target"] = counter;

  return (
    <span
      ref={spanRef}
      data-mode={mode}
      aria-hidden={spanProps.role ? undefined : true}
      className={cn("ds-shape-morph block", className)}
      style={{ ...(styleVars as CSSProperties), ...style }}
      {...spanProps}
    >
      <svg viewBox="0 0 100 100" className="block size-full overflow-visible" aria-hidden focusable="false">
        <g className={isLoader ? "ds-shape-morph-passive-spin" : undefined}>
          <g ref={gRef} transform={initial.current.transform}>
            <path ref={pathRef} d={initial.current.d} fill="currentColor" />
          </g>
        </g>
      </svg>
    </span>
  );
};
