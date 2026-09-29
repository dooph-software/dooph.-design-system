import type { Cubic } from "./cubic";

/**
 * Cubics -> SVG path `d`. Coordinates are rounded to 2 decimals, so callers
 * pass size 100 (0..100 units): at size 1 every point would snap to a 1/100
 * grid, which jitters visibly at large render sizes.
 */
export function toPathD(cubics: Cubic[], size = 100): string {
  if (cubics.length === 0) return "";
  const f = (n: number) => (n * size).toFixed(2);
  const parts = [`M${f(cubics[0].anchor0X)},${f(cubics[0].anchor0Y)}`];
  for (const c of cubics) {
    parts.push(`C${f(c.control0X)},${f(c.control0Y)} ${f(c.control1X)},${f(c.control1Y)} ${f(c.anchor1X)},${f(c.anchor1Y)}`);
  }
  parts.push("Z");
  return parts.join("");
}
