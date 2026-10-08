// WI-C7-60 type probe (F-115 item 4). Retarget the two dist paths in tsconfig.60.json to a scratch-worktree build.
// Today: TS2578 "Unused '@ts-expect-error' directive" on all three mutation lines (the shared defaults are mutable).
import {
  CalendarPresets, CloverShape, DatePicker, DatePickerMode, DatePickerSplitTrigger, PuffShape, ShapeMorphSpinner,
  DEFAULT_CALENDAR_PRESETS, DEFAULT_SPLIT_TRIGGER_PRESETS, SHAPE_MORPH_SPINNER_SHAPES, type CalendarPreset,
} from "@dooph-software/design-system";
const r = { from: new Date(2026, 0, 1), to: new Date(2026, 0, 7) };
// @ts-expect-error a package-wide default must not be mutable by one consumer
DEFAULT_CALENDAR_PRESETS.push(CalendarPresets.today);
// @ts-expect-error a package-wide default must not be mutable by one consumer
DEFAULT_SPLIT_TRIGGER_PRESETS.reverse();
// @ts-expect-error a package-wide default must not be mutable by one consumer
SHAPE_MORPH_SPINNER_SHAPES.reverse();
// Inputs that work today must keep compiling: mutable arrays, the defaults themselves, spreads.
const mine: CalendarPreset[] = [CalendarPresets.days.seven];
export const a = <DatePickerSplitTrigger value={r} onSelect={() => {}} presets={[CalendarPresets.days.seven]} />;
export const b = <DatePickerSplitTrigger value={r} onSelect={() => {}} presets={mine} />;
export const c = <DatePickerSplitTrigger value={r} onSelect={() => {}} presets={DEFAULT_SPLIT_TRIGGER_PRESETS} />;
export const d = <DatePicker mode={DatePickerMode.dateRange} value={r} onChange={() => {}} splitPresets={DEFAULT_SPLIT_TRIGGER_PRESETS} />;
export const e = <ShapeMorphSpinner shapes={[CloverShape, PuffShape]} />;
export const f = <ShapeMorphSpinner shapes={SHAPE_MORPH_SPINNER_SHAPES} />;
export const g = [CalendarPresets.today, ...DEFAULT_CALENDAR_PRESETS];
