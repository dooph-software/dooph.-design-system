import { probe, sref } from './rsc-walk.mjs';
import { pathToFileURL } from 'node:url';
const D = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build/dist/';
const { DEFAULT_CALENDAR_PRESETS, DatePickerMode } = await import(pathToFileURL(D + 'chunk-GF52K7CT.js').href);
const today = new Date(2026, 8, 30), range = { from: new Date(2026, 8, 1), to: new Date(2026, 8, 7) };
const mode = process.argv[2];
if (mode === 'sample') {
  console.log('--- NEUTRAL =', process.env.NEUTRAL || '(none)');
  await probe('Modal/ModalContent', 'chunk-TMRJXWHM.js', 'ModalContent', { children: 'x' });
  await probe('Modal/ModalOverlay', 'chunk-TMRJXWHM.js', 'ModalOverlay', {});
  await probe('Modal/ModalTitle', 'chunk-TMRJXWHM.js', 'ModalTitle', { children: 't' });
  await probe('Tooltip/TooltipProvider', 'chunk-OKX5BWIW.js', 'TooltipProvider', { children: 'x' });
  await probe('Tooltip/TooltipContent', 'chunk-OKX5BWIW.js', 'TooltipContent', { children: 'x' });
  await probe('Tooltip/TooltipContent rich no-portal', 'chunk-OKX5BWIW.js', 'TooltipContent', { children: 'x', variant: 'rich', portal: false });
  await probe('Tooltip/TooltipBody', 'chunk-OKX5BWIW.js', 'TooltipBody', { children: 'b' });
  await probe('Tabs/TabsList', 'chunk-S6ZPA5G2.js', 'TabsList', { children: 'x' });
  await probe('Tabs/TabsTrigger', 'chunk-S6ZPA5G2.js', 'TabsTrigger', { value: 'a', children: 'A' });
  await probe('Tabs/TabsContent', 'chunk-S6ZPA5G2.js', 'TabsContent', { value: 'a', children: 'A' });
  await probe('Tabs/tabTriggerVariants', 'chunk-S6ZPA5G2.js', 'tabTriggerVariants', null, { call: [{}] });
  await probe('SearchBox', 'chunk-NOCZEXFC.js', 'SearchBox', { shortcut: ['⌘', 'K'] });
  await probe('SplitButton', 'chunk-FAKJ36CJ.js', 'SplitButton', { children: 'Save' });
  await probe('DatePickerTrigger', 'chunk-3B6W7IHC.js', 'DatePickerTrigger', { mode: DatePickerMode.singleDay, value: today, today });
  await probe('DatePickerTrigger/formatTriggerLabel', 'chunk-3B6W7IHC.js', 'formatTriggerLabel', null, { call: [{ mode: DatePickerMode.singleDay, value: today }, today, 'en-US'] });
  await probe('Popover/PopoverContent', 'chunk-Z5DPCRRB.js', 'PopoverContent', { children: 'x' });
  await probe('Sheet/SheetContent', 'chunk-UIMQNOHP.js', 'SheetContent', { children: 'x' });
  await probe('LinearProgressIndicator', 'chunk-B7F63KJS.js', 'LinearProgressIndicator', { value: 40 });
}
if (mode === 'handlers') {
  console.log('--- NEUTRAL =', process.env.NEUTRAL || '(none)', '; consumer callbacks are server references');
  await probe('CalendarCaption', 'chunk-LQDN7FLX.js', 'CalendarCaption', { viewMonth: today, value: today, today, onMonthChange: sref('m') });
  await probe('CalendarPresetItem', 'chunk-EP2KBENK.js', 'CalendarPresetItem', { preset: DEFAULT_CALENDAR_PRESETS[0], today, onSelect: sref('s') });
  await probe('CalendarPresetsPanel', 'chunk-EP2KBENK.js', 'CalendarPresetsPanel', { children: 'x' });
  await probe('DatePickerSplitTrigger', 'chunk-N6ZVVDUC.js', 'DatePickerSplitTrigger', { value: range, today, onSelect: sref('s') });
  await probe('CalendarGrid', 'chunk-CMLMBSJI.js', 'CalendarGrid', { viewMonth: today, selectedRange: null, previewedRange: null, today, focusedDay: today, onDayClick: sref('c'), onDayHover: sref('h'), onDayHoverEnd: sref('e'), onDayKeyDown: sref('k'), dayRef: sref('r') });
  const steps = [{ value: 'low', label: 'Low' }, { value: 'high', label: 'High' }];
  await probe('AIThinkingEffortSelector', 'chunk-XNHXVPWW.js', 'AIThinkingEffortSelector', { steps, value: 'low', onValueChange: sref('v'), label: 'Thinking', labels: { start: 'Faster', end: 'Smarter' } });
  await probe('AIModelSelectTrigger', 'chunk-XNHXVPWW.js', 'AIModelSelectTrigger', { children: 'Model', detail: 'Medium' });
  await probe('AIModelSelectItem', 'chunk-XNHXVPWW.js', 'AIModelSelectItem', { value: 'm', children: 'Model', color: 'primary' });
  await probe('AIModelTooltipContent', 'chunk-XNHXVPWW.js', 'AIModelTooltipContent', { name: 'M', description: 'd', speed: 0.5 });
}
