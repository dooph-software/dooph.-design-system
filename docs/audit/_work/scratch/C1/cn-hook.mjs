// Load hook: replaces the built cn chunk with one that runs BOTH the shipped
// tailwind-merge config (OLD) and the config proposed for F-014/F-055 (NEW),
// returns OLD, and records every call where they differ in globalThis.__cnDiffs.
export async function load(url, context, nextLoad) {
  if (!/\/dist\/chunk-45MYJFCW\.js$/.test(url)) return nextLoad(url, context);
  const source = `
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
const OLD = extendTailwindMerge({ extend: { classGroups: { "text-style": ["text-style-button","text-style-body","text-style-label","text-style-title","text-style-heading","text-style-subheading","text-style-hero","text-style-mono"] } } });
const NEW = extendTailwindMerge({ extend: {
  theme: {
    text: ["label","body","hero-body","hero-button","mono","subheading","heading","title","hero","cta-standard","cta-big"],
    radius: ["slider-inner","tight","mini","normal","soft","checkbox","avatar","avatar-sm","calendar-day"],
    spacing: ["xxxs","xxs","xs","sm","rg","md","lg","xl","xxl","sticker-y"],
    shadow: ["button","button-secondary","button-hover","button-active","menu","standard","cta","focus-prominent","focus-primary","focus-danger"],
  },
  classGroups: {
    "text-style": [{ "text-style": [() => true] }],
    h: [{ h: ["button","button-sm","tab-micro","slider-track"] }],
    size: [{ size: ["button","button-sm","button-micro","checkbox","code-digit","tab-micro"] }],
    "min-h": [{ "min-h": ["button"] }],
    "min-w": [{ "min-w": ["button"] }],
  },
} });
globalThis.__cnDiffs ??= new Map();
function cn(...inputs) {
  const s = clsx(inputs);
  const o = OLD(s), n = NEW(s);
  if (o !== n) {
    const os = new Set(o.split(" ")), ns = new Set(n.split(" "));
    const lost = [...os].filter((c) => !ns.has(c)).join(" ");
    const key = (globalThis.__cnCtx ?? "?") + " | dropped by NEW: " + lost;
    globalThis.__cnDiffs.set(key, (globalThis.__cnDiffs.get(key) ?? 0) + 1);
  }
  return o;
}
export { cn };
`;
  return { format: 'module', source, shortCircuit: true };
}
