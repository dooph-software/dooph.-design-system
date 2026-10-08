import { cn, buttonVariants, ButtonVariant } from '../../../../../../dooph-ds-audit-build/dist/index.js';
const bv = buttonVariants({ variant: ButtonVariant.primary });
console.log('BV   :', bv);
const merged = cn(bv, 'text-body');
console.log('MERGE:', merged);
const a = new Set(bv.split(/\s+/)), b = new Set(merged.split(/\s+/));
console.log('dropped:', [...a].filter(x => !b.has(x)), 'added:', [...b].filter(x => !a.has(x)));
const cases = [['text-body','text-text'],['text-primary-fg','text-body'],['text-sm','text-primary-fg'],['rounded-tight','rounded-full'],['rounded-md','rounded-full'],['px-3','px-md'],['h-button','h-8'],['size-button','size-8'],['shadow-button','shadow-none'],['shadow-button','shadow-primary'],['gap-xs','gap-2'],['p-md','p-4'],['text-label','text-body'],['rounded-normal','rounded-soft']];
for (const c of cases) console.log(JSON.stringify(c), '->', JSON.stringify(cn(...c)));
