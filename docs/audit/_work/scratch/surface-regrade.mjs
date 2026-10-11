#!/usr/bin/env node
// surface-regrade.mjs <api-diff-reconciled.json> <out.md>
//
// Re-grades every api-diff line in the post-b436647 and "both" ranges that
// removes, narrows or retypes something (plus required additions), against
// the "breaking:" grade CHANGES.md gives it. Grades come from the RULES table
// below, written by hand after reading the entry and, where marked "probe",
// a tsc probe compiled against both built trees (scratchpad usage-probe.tsx /
// extends-probe.ts; results in the Task 1 report). A line no rule covers makes
// the script fail, so nothing is graded by default.

import { readFileSync, writeFileSync } from 'node:fs';

const [inP, outP] = process.argv.slice(2);
const lines = JSON.parse(readFileSync(inP, 'utf8'));

const PICK = /removed|type changed|now required|kind changed|member changed|member removed|value changed|ref type changed|signature changed|declared as|cascade layer|inherited props removed|is no longer|prop added: `[^?`]+: |member added: `[^?`]+: /;

// [regex on line text, grade, CHANGES.md grade + entry, note]
// grade: OK-BREAK (breaking; CHANGES says so), UNDER (breaking vs v5.3.0; CHANGES says no/minor),
//        NOT-BREAK (no v5.3.0 code stops working), NAMED-ELSEWHERE (breaking, covered by another entry's wording only)
const RULES = [
  [/export removed: `(formatRangeLabel|formatSingleLabel|isSameDay|startOfDay|checkboxVariants|formatTriggerLabel|serializeAxes)`/, 'OK-BREAK', 'yes — "Public-surface cleanup" + "Unblocked by the orchestrator"', ''],
  [/export removed: `(ProgressIndicatorVariants|FontAxes)`/, 'OK-BREAK', 'yes — "Const renames"', ''],
  [/export kind changed: `(ProgressIndicatorVariant|FontAxis)`/, 'NOT-BREAK', 'part of "Const renames"', 'the type gains a same-named const'],
  [/export removed: `(ToastTypes|TooltipTypes)`/, 'OK-BREAK', 'yes — "Size words, Tooltip/Toast variant names"', ''],
  [/`(Avatar)` prop type changed: `size`|`AvatarSize` (key removed|type changed)/, 'OK-BREAK', 'yes — "Size words"', ''],
  [/`Button` prop type changed: `size`|`ButtonSize` (key removed|type changed)|`ButtonProps` member changed: `size`/, 'OK-BREAK', 'yes — "Size words" (default → standard) + "no longer accept null"', ''],
  [/`Button` prop type changed: `variant`|`ButtonProps` member changed: `variant`/, 'UNDER', 'null removal: yes ("no longer accept null"); pill-size union: NO ("Button gets medium and big", breaking: no)', 'probe: `variant: ButtonVariant` + `size: ButtonSize` (both whole unions) fails; `interface X extends ButtonProps` fails (TS2312) at HEAD, passes at v5.3.0 and b436647'],
  [/`buttonVariants` signature changed/, 'OK-BREAK', 'yes — "Size words" (size default → standard); typography removal: yes — "Text is always set by a Text component"', ''],
  [/`tabTriggerVariants` signature changed/, 'OK-BREAK', 'yes — "Size words"; "Text is always set by a Text component"', ''],
  [/`CTAButton` prop type changed: `(asChild|children)`/, 'UNDER', 'no — "CTAButton children type-checks only with asChild" (minor)', 'probe: `<CTAButton text icon href>Label</CTAButton>` compiles at v5.3.0, fails at HEAD (TS2769)'],
  [/`CTAButton` ref type changed/, 'OK-BREAK', 'yes (type-level) — "Slider / LPI / CopyButton / CTAButton types"', 'probe: a RefObject<HTMLAnchorElement> still compiles; a callback ref typed (el: HTMLAnchorElement) does not'],
  [/`CopyButton` ref type changed/, 'OK-BREAK', 'yes (type-level) — "Slider / LPI / CopyButton / CTAButton types"', ''],
  [/`CopyButton` prop added: `value: string`/, 'UNDER', 'no at runtime, "minor-level type fix" — "CopyButton\'s props are real types"', 'probe: `<CopyButton />`, `<CopyButton value size="sm" />`, `<CopyButton value asChild><a/></CopyButton>` compile at v5.3.0 (props were any), fail at HEAD'],
  [/`(Calendar|CalendarPresetItem|DatePicker|DatePickerSplitTrigger)` prop removed: `(onSelect|selected|onChange)|`(CalendarProps|CalendarPresetItemProps|DatePickerProps|DatePickerSplitTriggerProps)` member removed: `(onSelect|selected|onChange)/, 'OK-BREAK', 'yes — "Value controls are named value / onValueChange"', ''],
  [/`(Calendar|CalendarPresetItem|DatePicker|DatePickerSplitTrigger)` prop added: `(value|onValueChange):|`(CalendarProps|CalendarPresetItemProps|DatePickerProps|DatePickerSplitTriggerProps)` member added: `(value|onValueChange):/, 'OK-BREAK', 'yes — "Value controls are named value / onValueChange"', 'the required half of the rename'],
  [/`(Calendar|HotkeyIndicator|SplitButton|SidebarWithHoverIcon)` ref type changed: `no ref`|Icons\] 89 components .* ref type changed|Shapes\] 7 components .* ref type changed/, 'NOT-BREAK', 'no — element-access entries', 'a ref is now accepted'],
  [/`(DatePicker)` prop type changed: `splitPresets`|`DatePickerSplitTrigger` prop type changed: `presets`|member changed: `(splitPresets|presets)`/, 'NOT-BREAK', 'no — "WI-120 readonly presets"', 'a readonly parameter accepts every array it did'],
  [/`(DEFAULT_CALENDAR_PRESETS|DEFAULT_SPLIT_TRIGGER_PRESETS)` value changed/, 'UNDER', 'no — "Orchestrator follow-up after wave F: readonly presets"', 'probe: `const p: CalendarPreset[] = DEFAULT_CALENDAR_PRESETS` (and the split one) compiles at v5.3.0, fails at HEAD (TS4104); `.push()` on the default fails too'],
  [/`TextDropdownTrigger` prop type changed: `size`|`TextDropdownSize` (key removed|type changed)/, 'OK-BREAK', 'yes — "Size words"', ''],
  [/Icons\] 89 components .* prop type changed: `size`|`IconProps` member changed: `size`|`SidebarWithHoverIcon` prop type changed: `size`|`SidebarWithHoverIconProps` member changed: `size`/, 'NOT-BREAK', 'no — "Icon size name is IconSize"', '`size` accepts exactly what it did (literals ⊂ string)'],
  [/`IconProps` declared as interface → type/, 'NOT-BREAK', 'no — icons element access', 'probe: `interface X extends IconProps` still compiles (an intersection, not a union)'],
  [/`IconSize` type changed/, 'OK-BREAK', 'type-only, "yes — v6 if cut as a major" — "Icon size name is IconSize"', ''],
  [/`LoadingSpinner` prop type changed: `color`|`LoadingSpinnerProps` member changed: `color`|`ProgressIndicator` prop type changed: `color`|`ProgressIndicatorProps` member changed: `color`/, 'NOT-BREAK', 'no — "One colour-name lookup"', 'widened to DsColor (name | any string); the `brand` name went in the pre-record rename'],
  [/`LoadingSpinner` prop type changed: `variant`|`LoadingSpinnerVariant` type changed/, 'NOT-BREAK', 'no — star variant', 'additive'],
  [/`OutlineButton` prop removed: `inverseTheme|`OutlineButtonProps` member removed: `inverseTheme/, 'OK-BREAK', 'yes — "OutlineButton inverseTheme → themeInverse"', ''],
  [/`SegmentedTabItem` prop type changed|`SegmentedTabItemProps` member changed/, 'NAMED-ELSEWHERE', 'implied, not named — "Size words" (default → standard) and "no longer accept null" name TabsTrigger only', 'SegmentedTabItemProps extends TabsTriggerProps, so it loses `default` and `null` too; the CHANGELOG must name SegmentedTabItem'],
  [/Shapes\] 7 components .* prop type changed: `size`|`ShapeProps` member changed: `size`/, 'UNDER', 'no — "Hero CTA: fixed shapes" (ShapeProps.size widened)', 'probe: code that READS `ShapeProps["size"]` as a number (`p.size * 2`) compiles at v5.3.0, fails at HEAD (TS2362). Passing a size is unaffected'],
  [/`SheetContent` prop type changed: `side`/, 'OK-BREAK', 'yes — "no longer accept null"', ''],
  [/`SplitButton` prop removed: `(children|className)|`SplitButtonProps` member removed: `(children|className)/, 'NOT-BREAK', 'no — "Four components now hand over their element"', 'probe: still accepted through HTMLAttributes<HTMLDivElement>'],
  [/`Checkbox` prop type changed: `variant`|`CheckboxProps` member changed: `variant`/, 'OK-BREAK', 'null removal: yes — "no longer accept null"; brand → prominent is pre-record (gaps.md §2 B1)', ''],
  [/`InputProps` member added: `icon:/, 'NOT-BREAK', 'CHANGES says yes ("Input icon variants require an icon element") but not vs v5.3.0', 'Input had no `variant` in v5.3.0; required only on the new icon variants'],
  [/`TabsTrigger` prop type changed|`TabsTriggerProps` member changed|`TabSize` (key removed|type changed)/, 'OK-BREAK', 'yes — "Size words" + "no longer accept null"', ''],
  [/`BaseText` prop type changed: `variant`|`TextVariant` type changed/, 'NOT-BREAK', 'no', 'additive values'],
  [/`ToastRoot` prop type changed: `variant`|`ToastRootProps` member changed: `variant`/, 'OK-BREAK', 'yes — "Size words" (ToastTypes → ToastVariant); the values brand/error → prominent/danger are pre-record (gaps.md §2 B1)', ''],
  [/`TooltipContent` prop type changed: `variant`|`TooltipContentProps` member changed: `variant`/, 'OK-BREAK', 'yes — "Size words" (TooltipTypes → TooltipVariant)', ''],
  [/`VerificationCodeInput` prop removed: `aria-label|`VerificationCodeInputProps` member removed: `aria-label/, 'NOT-BREAK', 'no — "Naming and cosmetic sweep"', 'probe: `<VerificationCodeInput aria-label="Code" />` still compiles (inherited from HTMLAttributes); default name unchanged'],
  [/`VerificationCodeInput` prop removed: `onChange|`VerificationCodeInputProps` member removed: `onChange/, 'OK-BREAK', 'yes — "Value controls are named value / onValueChange"', ''],
  [/`ToggleSize` (key removed|type changed)/, 'OK-BREAK', 'yes — "Size words" (default → standard)', 'iconSm → iconMicro is not breaking vs v5.3.0 (iconSm never released)'],
  [/`Shapes` type changed/, 'NOT-BREAK', 'post half additive (eightLeafClover); gem removal is pre-record (gaps.md §2 B6)', ''],
  [/cascade layer: unlayered → ds.tokens/, 'UNDER', 'no for the API — "Expression system" (asks to flag it as a behaviour change)', 'runtime: an unlayered consumer override now always beats the DS value, including `.dark` values and the reduced-motion block regardless of import order'],
  [/`--ui-color-ghost-foreground` value changed/, 'OK-BREAK', 'yes — "Size words" (ghost foreground → text colour)', ''],
  [/\[dark\] `--ui-color-text-tertiary` value changed/, 'NOT-BREAK', 'no — "Dark theme: complete" (placeholder value)', 'visual only'],
  [/\[dark\] `--ui-(radius-avatar|radius-avatar-sm|radius-checkbox|size-checkbox)` removed/, 'NOT-BREAK', 'no — "Dark theme: complete" (redundant dark lines)', 'value unchanged in dark; a consumer :root override now also reaches dark'],
  [/`--ui-height-button-micro` value changed/, 'OK-BREAK', 'yes — "Size words"', ''],
  [/`--ui-height-tab-micro` removed/, 'OK-BREAK', 'yes — "Size words"', 'v5.3.0 value 30px → button-micro 28px'],
  [/`--ui-(min-w-cta-pill-big|size-cta-icon)` removed|`\.ds-(min-w-cta-pill-big|size-cta-icon)` removed/, 'OK-BREAK', 'yes — "Hero CTA: fixed shapes"', ''],
  [/`--ui-(reveal-change|roll-change-(in|out)|roll-hover-duration|rolling-digits-(duration|ease|enter|exit)|sidebar-icon|underline-link)[\w-]*` removed/, 'OK-BREAK', 'yes — "Motion runs on one shared scale"', ''],
  [/`--ui-roll-change-(blur|depth)` value changed/, 'NOT-BREAK', 'no — "Chat parts secondary text + blur-roll soft clip"', 'visual: shorter travel; a px blur override still works'],
  [/`--ui-spacing-(lg|md|rg|sm|xl|xs|xxl)` value changed/, 'OK-BREAK', 'yes — "Spacing scale renamed"', ''],
  [/`\.ds-disabled-control` removed/, 'OK-BREAK', 'yes — "ds-disabled-control helper removed"', ''],
  [/`\.ds-(focus-ring|my-ui-xs)` removed/, 'OK-BREAK', 'yes — "Public-surface cleanup"', ''],
  [/`\.ds-(gap|p|pl|pr|px|py)-ui-[a-z]+` removed/, 'OK-BREAK', 'yes — "Spacing scale renamed" (ds-*-ui-* helpers)', ''],
];

const picked = lines.filter((l) => (l.when.includes('post') || l.when.includes('both')) && !/generated utilities/.test(l.section) && PICK.test(l.text));
const rows = [];
const missing = [];
for (const l of picked) {
  const r = RULES.find(([re]) => re.test(l.text));
  if (!r) { missing.push(l.text); continue; }
  rows.push({ text: l.text.replace(/^- /, ''), when: l.when, grade: r[1], record: r[2], note: r[3] });
}
if (missing.length) {
  console.error(`UNGRADED (${missing.length}):\n` + missing.join('\n'));
  process.exit(1);
}
const tally = rows.reduce((t, r) => ((t[r.grade] = (t[r.grade] ?? 0) + 1), t), {});
const cut = (s) => (s.length > 220 ? s.slice(0, 220) + '…' : s);
let md = `# Breaking re-grade of every removing / narrowing / retyping api-diff line after b436647\n\n`;
md += `Generated by \`docs/audit/_work/scratch/surface-regrade.mjs\` from \`api-diff-reconciled.json\`. Selection: every post or both line outside the generated utilities whose text says removed, type/member/value/signature/ref changed, kind changed, declared as, cascade layer, or a REQUIRED prop/member added. Grades are hand-written rules (see the script); a line no rule covers fails the run.\n\n`;
md += `Grades: **OK-BREAK** breaking vs v5.3.0 and CHANGES.md says so · **UNDER** breaking vs v5.3.0, CHANGES.md says no or minor · **NAMED-ELSEWHERE** breaking, but the entry names a different component · **NOT-BREAK** no v5.3.0 code stops working.\n\n`;
md += `| grade | lines |\n|---|---|\n` + Object.entries(tally).map(([g, n]) => `| ${g} | ${n} |`).join('\n') + `\n| **total** | **${rows.length}** |\n\n`;
md += `| grade | api-diff line | when | CHANGES.md says | note |\n|---|---|---|---|---|\n`;
const order = { UNDER: 0, 'NAMED-ELSEWHERE': 1, 'OK-BREAK': 2, 'NOT-BREAK': 3 };
for (const r of rows.sort((a, b) => order[a.grade] - order[b.grade])) md += `| ${r.grade} | ${cut(r.text).replace(/\|/g, '\\|')} | ${r.when} | ${r.record.replace(/\|/g, '\\|')} | ${r.note.replace(/\|/g, '\\|')} |\n`;
writeFileSync(outP, md);
console.log(tally, rows.length);
