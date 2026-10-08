/*
 * SVG path `d` -> morphable RoundedPolygon.
 * Ported from AOSP androidx.graphics.shapes (Apache 2.0). See THIRD_PARTY_NOTICES.md.
 *
 * ## behavior
 * - Port of androidx.graphics.shapes SvgPathParser.parseFeatures:
 *   parse to cubics -> first continuous sub-path -> detectFeatures ->
 *   PolygonValidator.fix (clockwise orientation).
 * - Output is in 0..1 units, scaled by the source viewBox (24 for DS Shapes)
 *   and centred at (0.5, 0.5): the frame centre, which is the rotation centre.
 *
 * ## constraints
 * - Normalize by the viewBox, never by the path's own bounds. Bounds scaling
 *   stretches any shape that does not touch all four edges (Pentagon is 23
 *   units tall), so the resting morph would stop matching the static Shape.
 * - Deviation from upstream: detectFeatures marks a sharp corner as a
 *   zero-length cubic whose `convexTo` cross product is 0, so every sharp
 *   corner gets the same flag (androidx TODO b/369320447). fixSharpCornerConvexity
 *   re-derives it from the tangents entering and leaving the point. Without
 *   it Morph pairs a staircase's inner steps with outer ones.
 * - Arc commands are not ported; they throw. No DS shape uses them.
 */
import { Cubic, detectFeatures, type Feature, featureReversed } from "./cubic";
import { RoundedPolygon } from "./polygon";
import { distanceEpsilon, type Point, pt } from "./utils";

const PARAM_COUNT: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, z: 0 };

function parseCubics(d: string): Cubic[] {
  const cubics: Cubic[] = [];
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? [];
  let i = 0;
  let pos = pt(0, 0);
  let start = pos;
  let prevLetter = "";
  let prevControl: Point | null = null;

  const num = () => Number.parseFloat(tokens[i++]);
  const line = (to: Point) => {
    cubics.push(Cubic.straightLine(pos.x, pos.y, to.x, to.y));
    pos = to;
  };
  const curve = (c0: Point, c1: Point, to: Point) => {
    cubics.push(new Cubic(pos.x, pos.y, c0.x, c0.y, c1.x, c1.y, to.x, to.y));
    pos = to;
  };

  while (i < tokens.length) {
    const cmd = tokens[i++];
    const letter = cmd.toLowerCase();
    if (letter === "a") throw new Error("polygonFromSvgPath: arc commands are not supported");
    if (!(letter in PARAM_COUNT)) throw new Error(`polygonFromSvgPath: unknown command ${cmd}`);
    const rel = cmd !== cmd.toUpperCase();

    if (letter === "z") {
      // Upstream always adds the closing line, even zero-length; detectFeatures absorbs it.
      line(start);
      prevLetter = "z";
      continue;
    }

    let first = true;
    do {
      const base = rel ? pos : pt(0, 0);
      const P = () => {
        const x = num();
        const y = num();
        return pt(base.x + x, base.y + y);
      };
      const reflected = () =>
        prevControl ? pt(2 * pos.x - prevControl.x, 2 * pos.y - prevControl.y) : pos;
      switch (letter) {
        case "m":
          if (first) {
            if (cubics.length > 0) return cubics; // first sub-path only, like upstream
            pos = P();
            start = pos;
          } else line(P()); // extra M pairs are implicit L
          prevControl = null;
          break;
        case "l":
          line(P());
          prevControl = null;
          break;
        case "h": {
          const x = num();
          line(pt(rel ? pos.x + x : x, pos.y));
          prevControl = null;
          break;
        }
        case "v": {
          const y = num();
          line(pt(pos.x, rel ? pos.y + y : y));
          prevControl = null;
          break;
        }
        case "c": {
          const c0 = P();
          const c1 = P();
          const to = P();
          curve(c0, c1, to);
          prevControl = c1;
          break;
        }
        case "s": {
          const c0 = "cs".includes(prevLetter) ? reflected() : pos;
          const c1 = P();
          const to = P();
          curve(c0, c1, to);
          prevControl = c1;
          break;
        }
        case "q": {
          // Upstream uses the quad control for both cubic controls; kept for parity.
          const c = P();
          const to = P();
          curve(c, c, to);
          prevControl = c;
          break;
        }
        case "t": {
          const c = "qt".includes(prevLetter) ? reflected() : pos;
          const to = P();
          curve(c, c, to);
          prevControl = c;
          break;
        }
      }
      prevLetter = letter;
      first = false;
    } while (i < tokens.length && !/[a-zA-Z]/.test(tokens[i]));
  }
  return cubics;
}

function fixSharpCornerConvexity(features: Feature[]): Feature[] {
  const outDir = (c: Cubic): Point => {
    const x = c.control0X - c.anchor0X;
    const y = c.control0Y - c.anchor0Y;
    return Math.hypot(x, y) > distanceEpsilon ? pt(x, y) : pt(c.anchor1X - c.anchor0X, c.anchor1Y - c.anchor0Y);
  };
  const inDir = (c: Cubic): Point => {
    const x = c.anchor1X - c.control1X;
    const y = c.anchor1Y - c.control1Y;
    return Math.hypot(x, y) > distanceEpsilon ? pt(x, y) : pt(c.anchor1X - c.anchor0X, c.anchor1Y - c.anchor0Y);
  };
  const n = features.length;
  return features.map((f, i) => {
    if (f.type !== "corner" || f.cubics.length !== 1 || !f.cubics[0].zeroLength()) return f;
    const prev = features[(i - 1 + n) % n].cubics.at(-1);
    const next = features[(i + 1) % n].cubics[0];
    if (!prev || !next) return f;
    const a = inDir(prev);
    const b = outDir(next);
    return { ...f, convex: a.x * b.y - a.y * b.x > 0 };
  });
}

/** PolygonValidator.fix: Morph expects clockwise outlines in y-down space. */
function fixOrientation(features: Feature[]): Feature[] {
  let signedArea = 0;
  for (const f of features) {
    for (const c of f.cubics) signedArea += (c.anchor1X - c.anchor0X) * (c.anchor1Y + c.anchor0Y);
  }
  if (signedArea < 0) return features;
  // Keep the first feature first so the polygon still starts on a corner.
  return [featureReversed(features[0]), ...features.slice(1).reverse().map(featureReversed)];
}

export function polygonFromSvgPath(d: string, viewBoxSize = 24): RoundedPolygon {
  const all = parseCubics(d);
  let n = all.length;
  for (let k = 0; k < all.length - 1; k++) {
    const a = all[k];
    const b = all[k + 1];
    if (
      Math.abs(b.anchor0X - a.anchor1X) >= distanceEpsilon ||
      Math.abs(b.anchor0Y - a.anchor1Y) >= distanceEpsilon
    ) {
      n = k + 1;
      break;
    }
  }
  const features = fixOrientation(fixSharpCornerConvexity(detectFeatures(all.slice(0, n))));
  if (features.length < 2) throw new Error("polygonFromSvgPath: path has fewer than 2 features");
  return new RoundedPolygon(features, pt(viewBoxSize / 2, viewBoxSize / 2)).transformed((x, y) =>
    pt(x / viewBoxSize, y / viewBoxSize),
  );
}
