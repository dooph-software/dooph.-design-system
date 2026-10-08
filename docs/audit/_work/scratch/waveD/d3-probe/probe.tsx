import { DatePicker, DatePickerMode, RollingDigitsText, Sticker, StickerVariant, ProgressIndicator, ProgressIndicatorVariant, LoadingSpinner, LoadingSpinnerSize, WavyDivider, WavyDividerVariant, type ProgressIndicatorProps, type LoadingSpinnerProps, type WavyDividerProps } from "../../../../../../src/index";
export const uncontrolledOpen = (
  <DatePicker mode={DatePickerMode.singleDay} value={new Date(2026, 0, 1)} onValueChange={() => {}} defaultOpen />
);
export const controlled = (
  <DatePicker mode={DatePickerMode.singleDay} value={new Date(2026, 0, 1)} onValueChange={() => {}} open onOpenChange={() => {}} />
);
export const r = <RollingDigitsText className="c" style={{ color: "red" }}>$1</RollingDigitsText>;
// @ts-expect-error custom requires color
export const s = <Sticker variant={StickerVariant.custom}>x</Sticker>;
const p: ProgressIndicatorProps = { progress: 0.5, variant: ProgressIndicatorVariant.wavy };
const l: LoadingSpinnerProps = { size: LoadingSpinnerSize.md };
const w: WavyDividerProps = { variant: WavyDividerVariant.high };
export const all = [<ProgressIndicator {...p} />, <LoadingSpinner {...l} />, <WavyDivider {...w} />];
