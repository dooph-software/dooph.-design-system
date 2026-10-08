// RSC approximation (adapted from V1): run with --conditions=react-server.
// - `import {x} from "react"` outside react -> shim over the react-server build (missing names = undefined)
// - a module whose first statement is "use client" -> client-reference stub, UNLESS its basename is listed
//   in env NEUTRAL (comma list), in which case the directive is stripped and it runs as server code
//   (simulates deleting the directive from that source file).
const NAMES = ['Children','Component','Fragment','Profiler','PureComponent','StrictMode','Suspense','cloneElement','createContext','createElement','createRef','forwardRef','isValidElement','lazy','memo','startTransition','use','useActionState','useCallback','useContext','useDebugValue','useDeferredValue','useEffect','useId','useImperativeHandle','useInsertionEffect','useLayoutEffect','useMemo','useOptimistic','useReducer','useRef','useState','useSyncExternalStore','useTransition','version','cache'];
const NEUTRAL = new Set((process.env.NEUTRAL || '').split(',').filter(Boolean));
export async function resolve(spec, context, nextResolve) {
  if (spec === 'react' && context.parentURL && !context.parentURL.includes('/node_modules/react/') && !context.parentURL.startsWith('virtual:')) {
    const real = await nextResolve(spec, context);
    return { url: 'virtual:react-shim?' + encodeURIComponent(real.url), shortCircuit: true, format: 'module' };
  }
  return nextResolve(spec, context);
}
export async function load(url, context, nextLoad) {
  if (url.startsWith('virtual:react-shim?')) {
    const real = decodeURIComponent(url.slice('virtual:react-shim?'.length));
    let src = `import R from ${JSON.stringify(real)};\nexport default R;\n`;
    for (const n of NAMES) src += `export const ${n} = R.${n};\n`;
    return { format: 'module', source: src, shortCircuit: true };
  }
  const r = await nextLoad(url, context);
  if (r.format !== 'module' || r.source == null) return r;
  const src = String(r.source);
  const head = src.replace(/^﻿/, '').trimStart();
  if (!/^["']use client["'];?/.test(head)) return r;
  const base = url.split('/').pop();
  if (NEUTRAL.has(base)) return { format: 'module', source: head.replace(/^["']use client["'];?/, '/* directive stripped */'), shortCircuit: true };
  const names = new Set();
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) for (const part of m[1].split(',')) { const p = part.trim(); if (!p) continue; const as = p.split(/\s+as\s+/); names.add((as[1] ?? as[0]).trim()); }
  for (const m of src.matchAll(/export\s+(?:const|let|var|function|class)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  let out = `const ref = (n) => ({ $$typeof: Symbol.for('react.client.reference'), $$id: ${JSON.stringify(base)} + '#' + n });\n`;
  for (const n of names) out += n === 'default' ? `export default ref('default');\n` : `export const ${n} = ref(${JSON.stringify(n)});\n`;
  return { format: 'module', source: out, shortCircuit: true };
}
