// Code that is valid against v5.3.0. Each probe is one statement on its own
// line so a tsc error line identifies it. Compiled against each tree's dist.
import * as React from "react";
import {
  ArrowShape, Button, ButtonSize, ButtonVariant, CTAButton, CopyButton,
  DEFAULT_CALENDAR_PRESETS, DEFAULT_SPLIT_TRIGGER_PRESETS, Input,
  LinearProgressIndicator, OutlineButton, SplitButton, SplitButtonTrigger,
  VerificationCodeInput,
} from "../dist/index.js";
import type { CalendarPreset, ShapeProps, ButtonProps } from "../dist/index.js";

declare const bv: ButtonVariant;
declare const bs: ButtonSize;
declare const anyButtonProps: ButtonProps;
const anchorRef = React.useRef<HTMLAnchorElement>(null);

export const p01 = <CTAButton text="Go" icon={<span />} href="/x">Label</CTAButton>; // P01 CTAButton children without asChild
export const p02 = <VerificationCodeInput aria-label="Code" />; // P02 VerificationCodeInput aria-label
export const p03 = <CopyButton />; // P03 CopyButton without value
export const p04 = <CopyButton value="x" size="sm" />; // P04 CopyButton size
export const p05 = <CopyButton value="x" asChild><a /></CopyButton>; // P05 CopyButton asChild + children
export const p06: React.JSX.Element = ArrowShape({ size: 24 }); // P06 shape called as a function typed JSX.Element
export const p07 = <Button variant={bv} size={bs}>x</Button>; // P07 Button whole-union variant x whole-union size
export const p08 = <Button {...anyButtonProps}>x</Button>; // P08 spread a ButtonProps value
export const p09: CalendarPreset[] = DEFAULT_CALENDAR_PRESETS; // P09 default presets as a mutable array
export const p10: CalendarPreset[] = DEFAULT_SPLIT_TRIGGER_PRESETS; // P10 split presets as a mutable array
export const p11 = (p: ShapeProps): number => p.size * 2; // P11 read ShapeProps.size as a number
export const p12 = <SplitButton className="x" icon={<span />}>Save</SplitButton>; // P12 SplitButton className
export const p13 = <SplitButtonTrigger aria-label="More" />; // P13 SplitButtonTrigger aria-label
export const p14 = <CTAButton ref={anchorRef} text="Go" icon={<span />} href="/x" />; // P14 CTAButton anchor ref (CHANGES: breaking)
export const p15 = <LinearProgressIndicator value={null} />; // P15 LPI value null (CHANGES: breaking)
export const p16 = <OutlineButton inverseTheme>x</OutlineButton>; // P16 inverseTheme (CHANGES: breaking)
export const p17 = <Input min="3" />; // P17 Input min as string (CHANGES: breaking)
export const p18 = <SplitButtonTrigger onClick={() => {}} />; // P18 SplitButtonTrigger handler
