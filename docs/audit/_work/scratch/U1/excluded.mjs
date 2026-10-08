// Which EXCLUDED/ALIASES entries in sync-theme.mjs are (a) names of non-existent tokens, (b) no-ops (no prefix rule would map them anyway)?
// Also: tokens neither mapped nor excluded (silently skipped). Run from repo root.
import { readFileSync } from "fs";
const src = readFileSync("scripts/sync-theme.mjs", "utf8");
const tokens = readFileSync("src/styles/tokens.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const rootBlock = tokens.match(/:root(?:\s*,\s*.light)?\s*\{([\s\S]*?)\}/)[1];
const names = [...new Set([...rootBlock.matchAll(/--(ui-[\w-]+)\s*:/g)].map((m) => m[1]))];
const exBlock = src.slice(src.indexOf("const EXCLUDED"), src.indexOf("]);", src.indexOf("const EXCLUDED")));
const excluded = [...exBlock.matchAll(/"(ui-[\w-]+)"/g)].map((m) => m[1]);
const alBlock = src.slice(src.indexOf("const ALIASES"), src.indexOf("};", src.indexOf("const ALIASES")));
const aliases = [...alBlock.matchAll(/"(ui-[\w-]+)":/g)].map((m) => m[1]);
const wouldMap = (k) => /^ui-color-/.test(k) || /^ui-shadow-/.test(k) || /^ui-radius-/.test(k) || /^ui-font-(body|button|heading|label|title|hero|mono)$/.test(k) || /^ui-text-/.test(k) || /^ui-spacing-/.test(k);
console.log("EXCLUDED entries:", excluded.length, " ALIASES:", aliases.length, " root tokens:", names.length);
console.log("EXCLUDED naming non-existent tokens:", excluded.filter((e) => !names.includes(e)));
console.log("ALIASES naming non-existent tokens:", aliases.filter((e) => !names.includes(e)));
const noop = excluded.filter((e) => !wouldMap(e));
const effective = excluded.filter((e) => wouldMap(e));
console.log("EXCLUDED no-op entries (no prefix rule matches; would be skipped anyway):", noop.length);
console.log("EXCLUDED effective entries:", effective);
const skipped = names.filter((n) => !wouldMap(n) && !excluded.includes(n) && !aliases.includes(n));
console.log("Tokens silently skipped (unmapped, not in EXCLUDED):", skipped.length, skipped.join(" "));
