/**
 * Custom SVG port of Material 3's circular wavy-indicator geometry.
 *
 * Material builds the active indicator from a rounded star polygon rather
 * than a sampled sine wave. Each sharp star vertex is cut back along its two
 * adjoining edges and replaced with a tangent cubic curve. This preserves the
 * playful alternating radii without drawing through pointed vertices.
 */

const MATERIAL_WAVELENGTH = 15;
const MIN_WAVE_COUNT = 5;
const INNER_RADIUS_RATIO = 0.66;
const OUTER_CORNER_RADIUS = 0.35;
const OUTER_CORNER_SMOOTHING = 0.4;
const INNER_CORNER_RADIUS = 0.5;
const START_ANGLE = -Math.PI / 2;

type Point = {
  x: number;
  y: number;
};

type RoundedCorner = {
  entry: Point;
  control1: Point;
  control2: Point;
  exit: Point;
};

export type MaterialWaveGeometry = {
  path: string;
  waveCount: number;
  outerRadius: number;
  innerRadius: number;
};

export type WavyTrackGeometry = {
  length: number;
  offset: number;
};

function format(value: number): string {
  const rounded = Math.abs(value) < 0.0005 ? 0 : Number(value.toFixed(3));
  return String(rounded);
}

function pointOnCircle(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): Point {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function subtract(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

function multiply(point: Point, scalar: number): Point {
  return { x: point.x * scalar, y: point.y * scalar };
}

function magnitude(point: Point): number {
  return Math.hypot(point.x, point.y);
}

function normalize(point: Point): Point {
  return multiply(point, 1 / magnitude(point));
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

function cubicPoint(corner: RoundedCorner, t: number): Point {
  const oneMinusT = 1 - t;
  return {
    x:
      oneMinusT ** 3 * corner.entry.x +
      3 * oneMinusT ** 2 * t * corner.control1.x +
      3 * oneMinusT * t ** 2 * corner.control2.x +
      t ** 3 * corner.exit.x,
    y:
      oneMinusT ** 3 * corner.entry.y +
      3 * oneMinusT ** 2 * t * corner.control1.y +
      3 * oneMinusT * t ** 2 * corner.control2.y +
      t ** 3 * corner.exit.y,
  };
}

function midpoint(a: Point, b: Point): Point {
  return multiply(add(a, b), 0.5);
}

/** Split a cubic at its midpoint using de Casteljau's construction. */
function splitCubicAtHalf(
  corner: RoundedCorner,
): [RoundedCorner, RoundedCorner] {
  const entryToControl1 = midpoint(corner.entry, corner.control1);
  const control1ToControl2 = midpoint(corner.control1, corner.control2);
  const control2ToExit = midpoint(corner.control2, corner.exit);
  const leftControl2 = midpoint(entryToControl1, control1ToControl2);
  const rightControl1 = midpoint(control1ToControl2, control2ToExit);
  const splitPoint = midpoint(leftControl2, rightControl1);

  return [
    {
      entry: corner.entry,
      control1: entryToControl1,
      control2: leftControl2,
      exit: splitPoint,
    },
    {
      entry: splitPoint,
      control1: rightControl1,
      control2: control2ToExit,
      exit: corner.exit,
    },
  ];
}

/**
 * Returns the smooth circular remainder track, or `null` when no track should
 * be painted. A zero-length round-capped SVG dash still renders a dot, so the
 * complete state must omit the track rather than relying on a `0` dash.
 */
export function getWavyTrackGeometry(
  progress: number,
  circumference: number,
  gapLength: number,
): WavyTrackGeometry | null {
  if (progress === 0) {
    return { length: circumference, offset: 0 };
  }

  const activeLength = circumference * progress;
  const length = Math.max(
    0,
    circumference - activeLength - 2 * gapLength,
  );
  if (length === 0) return null;

  return {
    length,
    offset: length + circumference - (activeLength + gapLength),
  };
}

/**
 * Creates one stable, closed path for the complete wave. Progress is revealed
 * with SVG dash properties, so changing progress never changes the path's
 * vertices or introduces an asymmetric partial-wave approximation.
 */
export function createMaterialWaveGeometry(
  diameter: number,
  strokeWidth: number,
): MaterialWaveGeometry {
  const cx = diameter / 2;
  const cy = diameter / 2;
  const outerRadius = (diameter - strokeWidth) / 2;
  const innerRadius = outerRadius * INNER_RADIUS_RATIO;
  const waveCount = Math.max(
    MIN_WAVE_COUNT,
    Math.round((2 * Math.PI * outerRadius) / MATERIAL_WAVELENGTH),
  );
  const vertexCount = waveCount * 2;

  // Construct the star in a unit-radius coordinate space. Rounding happens
  // before scaling, matching Material's normalized RoundedPolygon workflow.
  const points = Array.from({ length: vertexCount }, (_, index) => {
    const radius = index % 2 === 0 ? 1 : INNER_RADIUS_RATIO;
    const angle = START_ANGLE + (index * Math.PI) / waveCount;
    return pointOnCircle(0, 0, radius, angle);
  });

  const cornerInputs = points.map((vertex, index) => {
    const previous = points[(index - 1 + vertexCount) % vertexCount];
    const next = points[(index + 1) % vertexCount];
    const toPrevious = normalize(subtract(previous, vertex));
    const toNext = normalize(subtract(next, vertex));
    const angle = Math.acos(
      Math.max(-1, Math.min(1, dot(toPrevious, toNext))),
    );
    const isOuter = index % 2 === 0;
    const radius = isOuter ? OUTER_CORNER_RADIUS : INNER_CORNER_RADIUS;
    const smoothing = isOuter ? OUTER_CORNER_SMOOTHING : 0;

    return {
      vertex,
      toPrevious,
      toNext,
      angle,
      edgeLength: magnitude(subtract(next, vertex)),
      // Smoothing lengthens Material's outer transition while the inner corner
      // uses its circular rounding directly.
      desiredCut:
        (radius / Math.tan(angle / 2)) * (1 + smoothing),
    };
  });

  // Adjacent cuts share an edge. Scale them together when necessary so they
  // can meet but never cross, which keeps every lobe identical.
  const cutScale = cornerInputs.reduce((scale, corner, index) => {
    const next = cornerInputs[(index + 1) % vertexCount];
    return Math.min(
      scale,
      corner.edgeLength / (corner.desiredCut + next.desiredCut),
    );
  }, 1);

  const corners = cornerInputs.map((corner) => {
    const cut = corner.desiredCut * cutScale;
    const entry = add(corner.vertex, multiply(corner.toPrevious, cut));
    const exit = add(corner.vertex, multiply(corner.toNext, cut));
    const effectiveRadius = cut * Math.tan(corner.angle / 2);
    const turnAngle = Math.PI - corner.angle;
    const handle =
      (4 / 3) * Math.tan(turnAngle / 4) * effectiveRadius;

    return {
      entry,
      control1: subtract(entry, multiply(corner.toPrevious, handle)),
      control2: subtract(exit, multiply(corner.toNext, handle)),
      exit,
    };
  });

  // Rounding cuts the raw outer vertex away. Normalize the rounded curve so
  // each lobe's midpoint still reaches the original outer radius/viewBox edge.
  const roundedPeakRadius = magnitude(cubicPoint(corners[0], 0.5));
  const scaleToViewBox = outerRadius / roundedPeakRadius;
  const toViewBox = (point: Point) => ({
    x: cx + point.x * scaleToViewBox,
    y: cy + point.y * scaleToViewBox,
  });

  // Start at the midpoint of the first rounded outer corner (12 o'clock), not
  // at its entry point before 12. Splitting preserves the exact same curve
  // while making progress and the circular remainder share one angular origin.
  const [firstHalf, secondHalf] = splitCubicAtHalf(corners[0]);
  const start = toViewBox(secondHalf.entry);
  const secondControl1 = toViewBox(secondHalf.control1);
  const secondControl2 = toViewBox(secondHalf.control2);
  const secondExit = toViewBox(secondHalf.exit);
  const firstInnerEntry = toViewBox(corners[1].entry);
  const commands = [
    `M ${format(start.x)} ${format(start.y)}`,
    `C ${format(secondControl1.x)} ${format(secondControl1.y)} ${format(secondControl2.x)} ${format(secondControl2.y)} ${format(secondExit.x)} ${format(secondExit.y)}`,
    `L ${format(firstInnerEntry.x)} ${format(firstInnerEntry.y)}`,
  ];

  for (let index = 1; index < vertexCount; index++) {
    const corner = corners[index];
    const control1 = toViewBox(corner.control1);
    const control2 = toViewBox(corner.control2);
    const exit = toViewBox(corner.exit);
    const nextEntry =
      index === vertexCount - 1
        ? toViewBox(firstHalf.entry)
        : toViewBox(corners[index + 1].entry);

    commands.push(
      `C ${format(control1.x)} ${format(control1.y)} ${format(control2.x)} ${format(control2.y)} ${format(exit.x)} ${format(exit.y)}`,
      `L ${format(nextEntry.x)} ${format(nextEntry.y)}`,
    );
  }

  const firstControl1 = toViewBox(firstHalf.control1);
  const firstControl2 = toViewBox(firstHalf.control2);
  const firstExit = toViewBox(firstHalf.exit);
  commands.push(
    `C ${format(firstControl1.x)} ${format(firstControl1.y)} ${format(firstControl2.x)} ${format(firstControl2.y)} ${format(firstExit.x)} ${format(firstExit.y)}`,
  );
  commands.push("Z");

  return {
    path: commands.join(" "),
    waveCount,
    outerRadius,
    innerRadius,
  };
}
