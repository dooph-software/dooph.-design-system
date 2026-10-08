// Maintainer review round 1 (2026-10-04) — quick fixes. Each edit asserts its anchor occurs once.
import fs from 'node:fs';
const edit = (f, from, to, all = false) => {
  let s = fs.readFileSync(f, 'utf8');
  if (s.includes(to) && !s.includes(from)) return;
  const n = s.split(from).length - 1;
  if (all ? n < 1 : n !== 1) throw new Error(`${f}: anchor ×${n} — ${from.slice(0, 70)}`);
  s = all ? s.split(from).join(to) : s.replace(from, () => to);
  fs.writeFileSync(f, s);
};
const T = 'src/styles/tokens.css', C = 'src/styles/dooph-component-tokens.css';

// #15 typeable caret morphs clover → eight-leaf clover (was puff)
edit('src/components/DropdownCaret/DropdownCaret.tsx', 'typeable: [Shapes.clover, Shapes.puff],', 'typeable: [Shapes.clover, Shapes.eightLeafClover],');

// decision 6 — spokes (and the star, which shares the spokes rate) slower: 1280 → 1800ms base
edit(T, '--ui-spinner-spokes-duration: 1280ms;', '--ui-spinner-spokes-duration: 1800ms;');

// #2 big CTA shape fills its 60px frame (to the 16px pill padding), like standard fills its chip
edit(T, '--ui-size-cta-shape-big: 50px;', '--ui-size-cta-shape-big: var(--ui-size-cta-chip-big);');

// #6 focus-ring width as a token, with a small step for small controls (checkbox)
edit(T, '  --ui-color-focus-ring-prominent: rgba(36, 6, 172, 0.35);',
  '  /* Focus-ring outline width (Figma buttonSizes/focus-ring-spread), and the small\n   * step for compact controls such as Checkbox, where 4px reads as huge. */\n  --ui-focus-ring-width: 4px;\n  --ui-focus-ring-width-sm: 2px;\n  --ui-color-focus-ring-prominent: rgba(36, 6, 172, 0.35);');
edit(C, '    outline: 4px solid transparent;', '    outline: var(--ds-focus-ring-width, var(--ui-focus-ring-width)) solid transparent;', true);
edit(C, '  .ds-focus-visible-ring {\n',
  '  /* Compact controls opt into the small ring width; every ds-focus-* helper reads it. */\n  .ds-focus-ring-sm {\n    --ds-focus-ring-width: var(--ui-focus-ring-width-sm);\n  }\n\n  .ds-focus-visible-ring {\n');
edit('src/components/Checkbox/Checkbox.tsx', '"focus-visible:border-input-border-focus ds-focus-visible-ring",', '"focus-visible:border-input-border-focus ds-focus-visible-ring ds-focus-ring-sm",');

// #10 highlighted step reads clearly while dragging: full slider colour off the fill (the fill's own
// active-dot paint already contrasts on it)
edit(C, '  .ds-slider-dot[data-highlighted] {\n    height: var(--ui-height-slider-step-tall);\n  }\n',
  '  .ds-slider-dot[data-highlighted] {\n    height: var(--ui-height-slider-step-tall);\n  }\n\n  /* During a drag the tall step marks the value the drag started from; at the\n   * inactive dot paint it is easy to miss, so it takes the slider colour until\n   * release. On the filled side the active-dot paint already contrasts. */\n  [data-dragging] .ds-slider-dot[data-highlighted]:not([data-active]) {\n    background-color: var(--ds-slider-color, var(--ui-color-primary));\n  }\n');
console.log('quick fixes applied');
