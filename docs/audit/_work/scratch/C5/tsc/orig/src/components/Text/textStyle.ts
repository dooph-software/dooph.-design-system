/*
 * Resolution of BaseText's typography props into an inline style object.
 * Server-safe (no "use client") — pure functions over plain values.
 *
 * Why inline instead of classes (which is what this replaced): a class-based
 * prop only wins if it happens to be emitted after the role's own class, which
 * depends on bundler and import order. That bet was being lost — the old
 * fontSize/fontFamily props emitted `text-hero`/`font-hero`, both of which sit
 * ~50kB earlier in the compiled sheet than `.text-style-body`, so they did
 * nothing. Inline style outranks every layer, so a prop that is set always wins.
 */

import type { CSSProperties } from 'react';
import {
  ROLE_AXIS_TOKEN,
  type FontAxesValue,
  type FontSizeValue,
  type FontValue,
  type FontWeightValue,
  type LetterSpacingValue,
  type LineHeightValue,
  type TextVariant,
} from './constants';

/** Numbers mean px; strings (incl. `var(--ui-*)` tokens) pass through. */
const toLength = (value: string | number | undefined) =>
  typeof value === 'number' ? `${value}px` : value;

/** Numbers stay unitless — a line-height ratio scales with font-size, px does not. */
const toUnitless = (value: string | number | undefined) =>
  typeof value === 'number' ? String(value) : value;

/**
 * `{ GRAD: 20, wdth: 110 }` → `"GRAD" 20, "wdth" 110`.
 * Axis tags are case-sensitive and must be quoted.
 */
export const serializeAxes = (axes: FontAxesValue): string =>
  Object.entries(axes)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([axis, value]) => `"${axis}" ${value}`)
    .join(', ');

export interface TextStyleProps {
  font?: FontValue;
  fontSize?: FontSizeValue;
  fontWeight?: FontWeightValue;
  lineHeight?: LineHeightValue;
  letterSpacing?: LetterSpacingValue;
  axes?: FontAxesValue;
  /**
   * Fixed-advance figures (`font-variant-numeric: tabular-nums`).
   *
   * Every digit takes the same width, so a number does not reflow as its digits
   * change — the reason to turn it on for anything that ticks, counts down, or
   * sits in a column that must align. It costs the proportional spacing the
   * face was drawn with, so it is opt-in rather than a default on body copy.
   *
   * `false` is not the same as omitting it: `false` writes
   * `proportional-nums`, forcing figures back to proportional even where an
   * ancestor turned tabular on. Omit to inherit.
   *
   * The face has to ship the `tnum` feature. Effectively all modern text faces
   * do; one that does not simply renders proportional figures, with no error.
   */
  tabular?: boolean;
}

/**
 * Build the inline style for a set of typography props.
 *
 * Only props that were actually passed produce a declaration, so anything left
 * alone keeps falling through to the role class.
 *
 * @param variant  Role in play, used to prepend its axis token so `axes` MERGES
 *                 with the role's axes rather than replacing them. Pass
 *                 undefined when the role class is not applied (`unstyled`).
 */
export const buildTextStyle = (
  {
    font,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    axes,
    tabular,
  }: TextStyleProps,
  variant: TextVariant | undefined,
): CSSProperties | undefined => {
  const style: CSSProperties = {};

  if (font !== undefined) style.fontFamily = font;
  if (fontSize !== undefined) style.fontSize = toLength(fontSize);
  if (fontWeight !== undefined) style.fontWeight = toUnitless(fontWeight);
  if (lineHeight !== undefined) style.lineHeight = toUnitless(lineHeight);
  if (letterSpacing !== undefined) style.letterSpacing = toLength(letterSpacing);
  /* Explicit both ways. `proportional-nums` rather than `normal` so passing
   * false overrides an inherited tabular run instead of merely declining to
   * set one. */
  if (tabular !== undefined) {
    style.fontVariantNumeric = tabular ? 'tabular-nums' : 'proportional-nums';
  }

  if (axes !== undefined) {
    const own = serializeAxes(axes);
    if (own) {
      /* Duplicate axes resolve last-wins, so appending to the role's token
       * overrides just the axes named here and leaves the rest intact.
       * Roles without a token must not reference one: an undefined var makes
       * the whole declaration invalid, which would drop the axes entirely. */
      const roleAxes = variant ? ROLE_AXIS_TOKEN[variant] : undefined;
      style.fontVariationSettings = roleAxes ? `${roleAxes}, ${own}` : own;
    }
  }

  return Object.keys(style).length > 0 ? style : undefined;
};
