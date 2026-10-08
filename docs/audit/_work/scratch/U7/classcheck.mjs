import fs from 'node:fs';
const css = fs.readFileSync('docs/audit/_work/dist-styles.css', 'utf8');
const classes = `flex items-stretch flex-col gap-sm p-rg ds-calendar-panel-w items-center justify-between gap-xs text-ghost-fg-active
grid w-full grid-cols-7 select-none contents justify-center pb-xs text-ghost-fg group/day relative aspect-square p-xxs bg-ghost-active rounded-calendar-day hover:bg-ghost-hover rounded-l-calendar-day rounded-r-calendar-day pointer-events-none absolute inset-0 bg-primary group-hover/day:bg-primary-hover border border-solid border-primary-border size-full cursor-pointer bg-transparent ds-focus-visible-ring ds-disabled-state text-primary-fg
gap-xxs p-xs ds-calendar-presets-w border-r border-border-primary
inline-flex rounded-tight shadow-button [&>*]:rounded-r-none [&>*]:border-r-0 rounded-r-none border-r-0 h-button rounded-l-none rounded-r-tight bg-secondary bg-secondary-disabled border-secondary-border-disabled h-full ds-radius-tight-inset-xxs
data-[state=open]:border-input-border-focus ds-focus-ring-on-open
z-50 overflow-hidden rounded-normal bg-surface-primary data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 ds-radix-popover-content-origin
size-1 rounded-full flex-wrap gap-md p-md justify-end`.split(/\s+/).filter(Boolean);
const esc = (c) => c.replace(/([^a-zA-Z0-9_-])/g, (m) => '\\' + m);
const identChar = /[a-zA-Z0-9_\-\\]/;
for (const c of [...new Set(classes)]) {
  const sel = '.' + esc(c);
  let idx = -1;
  let found = false;
  while ((idx = css.indexOf(sel, idx + 1)) !== -1) {
    const nx = css[idx + sel.length];
    if (!nx || !identChar.test(nx)) { found = true; break; }
  }
  console.log((found ? 'OK   ' : 'MISS ') + c);
}
