// Walks a server-rendered element tree the way a Flight render would, and reports
// (a) TypeErrors from React APIs missing in the react-server build, and
// (b) function-valued props handed to a host element or a client reference
//     (React Flight rejects these: "Event handlers cannot be passed to Client Component props" /
//      "Functions cannot be passed directly to Client Components"). Functions tagged as
//     server references (what a Server Component can legally pass) are allowed.
import R from 'file:///C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/react/react.react-server.js';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const DIST = 'C:/Users/stick/Github/dooph/dooph-ds-audit-build/dist';
const S = (n) => Symbol.for(n);
const internals = R.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
let idc = 0;
internals.H = { useMemo: (f) => f(), useCallback: (f) => f, useId: () => '_r' + (idc++) + '_', use: (x) => { throw new Error('use() not simulated'); }, useDebugValue() {} };
const sref = (name) => { const f = () => {}; f.$$typeof = S('react.server.reference'); f.$$id = 'action#' + name; return f; };
const isEl = (v) => v && typeof v === 'object' && (v.$$typeof === S('react.transitional.element') || v.$$typeof === S('react.element'));
const isClientRef = (t) => t && t.$$typeof === S('react.client.reference');
const tname = (t) => typeof t === 'string' ? '<' + t + '>' : isClientRef(t) ? 'client:' + t.$$id : t?.displayName || t?.render?.displayName || t?.name || String(t?.$$typeof?.description ?? t);
function scanFns(obj, where, out, seen = new Set(), p = '') {
  if (obj == null || typeof obj !== 'object' || seen.has(obj) || isEl(obj)) return;
  seen.add(obj);
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'children' && p === '') continue;
    if (typeof v === 'function' && v.$$typeof !== S('react.server.reference')) out.push(`${where}: function prop "${p}${k}"`);
    else if (v && typeof v === 'object' && !isEl(v)) scanFns(v, where, out, seen, p + k + '.');
  }
}
function walk(node, out, depth = 0) {
  if (depth > 60 || node == null || typeof node === 'boolean' || typeof node === 'string' || typeof node === 'number') return;
  if (Array.isArray(node)) { node.forEach((n) => walk(n, out, depth + 1)); return; }
  if (typeof node === 'function') { out.push('function as child'); return; }
  if (!isEl(node)) return;
  const { type, props } = node;
  if (type === S('react.fragment')) { walk(props.children, out, depth + 1); return; }
  if (typeof type === 'string' || isClientRef(type)) {
    scanFns(props, tname(type), out);
    if (typeof props.children === 'function') out.push(`${tname(type)}: function as children`);
    for (const [k, v] of Object.entries(props)) if (isEl(v) || Array.isArray(v)) walk(v, out, depth + 1);
    return;
  }
  try {
    let res;
    if (type?.$$typeof === S('react.forward_ref')) { const { ref, ...rest } = props; res = type.render(rest, ref ?? null); }
    else if (type?.$$typeof === S('react.memo')) { res = R.createElement(type.type, props); }
    else if (typeof type === 'function') res = type(props);
    else { out.push('unhandled type ' + tname(type)); return; }
    walk(res, out, depth + 1);
  } catch (e) { out.push(`${tname(type)} render THREW ${e.constructor.name}: ${String(e.message).split('\n')[0]}`); }
}
export async function probe(label, chunk, exportName, props, opts = {}) {
  let m;
  try { m = await import(pathToFileURL(path.join(DIST, chunk)).href); } catch (e) { console.log(`${label}: module-eval FAIL ${e.message}`); return; }
  const C = m[exportName];
  if (isClientRef(C)) { console.log(`${label}: ${exportName} is a CLIENT REFERENCE ($$id ${C.$$id})` + (opts.call ? ` -> calling it: ${(() => { try { C(); return 'ok'; } catch (e) { return e.constructor.name + ': ' + e.message; } })()}` : '')); return; }
  if (opts.call) { try { console.log(`${label}: ${exportName}(...) on server -> ${JSON.stringify(C(...opts.call))}`); } catch (e) { console.log(`${label}: ${exportName}() THREW ${e.message}`); } return; }
  const out = [];
  walk(R.createElement(C, props), out);
  console.log(`${label}: ${out.length ? 'PROBLEMS\n    - ' + out.join('\n    - ') : 'clean (no missing React API, no function prop to host/client component)'}`);
}
export { sref };
