import assert from "node:assert/strict";
import test from "node:test";
// Node's built-in strip-types runner requires the source extension; the package
// compiler intentionally does not enable allowImportingTsExtensions.
// @ts-expect-error TS5097 -- required by the zero-dependency Node test command.
import * as waveGeometryModule from "./waveGeometry.ts";

const { createMaterialWaveGeometry } = waveGeometryModule;

test("rounds all nine Material lobes without passing through sharp star vertices", () => {
  const geometry = createMaterialWaveGeometry(48, 4);

  assert.equal(geometry.waveCount, 9);
  assert.equal(geometry.outerRadius, 22);
  assert.ok(Math.abs(geometry.innerRadius - 14.52) < 0.000001);
  assert.equal(geometry.path.match(/\bC\b/g)?.length, 19);
  assert.equal(geometry.path.match(/\bL\b/g)?.length, 18);
  assert.match(geometry.path, /^M 24 2 C /);
  assert.match(geometry.path, / Z$/);
});

test("keeps the rounded wave inside each supported spinner viewBox", () => {
  const sizes = [
    [16, 2],
    [22, 2.5],
    [32, 3],
    [40, 3],
  ] as const;

  for (const [diameter, strokeWidth] of sizes) {
    const geometry = createMaterialWaveGeometry(diameter, strokeWidth);
    const coordinates = geometry.path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];

    assert.ok(geometry.waveCount >= 5);
    assert.ok(coordinates.every((coordinate) => coordinate >= 0));
    assert.ok(coordinates.every((coordinate) => coordinate <= diameter));
  }
});

test("omits the round-capped inactive track when progress is complete", () => {
  const getWavyTrackGeometry = (
    waveGeometryModule as unknown as Record<string, unknown>
  ).getWavyTrackGeometry;
  assert.equal(typeof getWavyTrackGeometry, "function");
  if (typeof getWavyTrackGeometry !== "function") return;

  const circumference = 100;

  assert.deepEqual(getWavyTrackGeometry(0, circumference, 4), {
    length: circumference,
    offset: 0,
  });
  assert.equal(getWavyTrackGeometry(1, circumference, 4), null);
});
