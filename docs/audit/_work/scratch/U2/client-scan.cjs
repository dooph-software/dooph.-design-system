// Scan every non-story src module: "use client" present? client-forcing APIs used?
// node client-scan.cjs <repoRoot>
const fs = require('fs');
const path = require('path');
const root = process.argv[2];
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d)) {
    const f = path.join(d, e);
    if (fs.statSync(f).isDirectory()) walk(f);
    else if (/\.(ts|tsx)$/.test(e) && !/\.stories\.tsx$/.test(e)) files.push(f);
  }
})(path.join(root, 'src'));

const HOOK = /\b(?:React\.)?(useState|useEffect|useRef|useLayoutEffect|useContext|useReducer|useImperativeHandle|useSyncExternalStore|useTransition|useDeferredValue|useOptimistic|useActionState|useInsertionEffect|createContext)\b/g;
const CUSTOM_HOOK = /\b(use(?!State|Effect|Ref|LayoutEffect|Context|Reducer|ImperativeHandle|SyncExternalStore|Transition|DeferredValue|Optimistic|ActionState|InsertionEffect|Id|Memo|Callback)[A-Z]\w*)\s*\(/g;
const BROWSER = /\b(window\.|document\.|navigator\.|requestAnimationFrame|cancelAnimationFrame|setTimeout|setInterval|clearTimeout|clearInterval|ResizeObserver|IntersectionObserver|MutationObserver|localStorage|matchMedia|getComputedStyle|getBoundingClientRect)\b/g;
const HANDLER = /\bon[A-Z]\w*=\{([^}]*)\}?/g;

const out = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const rel = path.relative(root, f).replace(/\\/g, '/');
  // directive: first statement (allow leading block comment)
  const stripped = src.replace(/^﻿/, '').replace(/^\s*(\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*/, '');
  const directive = /^['"]use client['"];?/.test(stripped);
  const first5 = src.split('\n').slice(0, 5).some((l) => /^['"]use client['"];?$/.test(l.trim()));
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const hooks = [...new Set([...code.matchAll(HOOK)].map((m) => m[1]))];
  const custom = [...new Set([...code.matchAll(CUSTOM_HOOK)].map((m) => m[1]))];
  const browser = [...new Set([...code.matchAll(BROWSER)].map((m) => m[1]))];
  const handlers = [...code.matchAll(HANDLER)].map((m) => m[0].slice(0, 60).replace(/\s+/g, ' '));
  out.push({ rel, directive, first5, hooks, custom, browser, handlers });
}
for (const o of out) {
  console.log(
    `${o.rel} | directive=${o.directive}${o.directive !== o.first5 ? ' (first5=' + o.first5 + ')' : ''} | hooks=${o.hooks.join(',')} | custom=${o.custom.join(',')} | browser=${o.browser.join(',')} | handlers=${o.handlers.length ? o.handlers.join(' ;; ') : ''}`,
  );
}
console.log('TOTAL', out.length, 'with directive', out.filter((o) => o.directive).length);
