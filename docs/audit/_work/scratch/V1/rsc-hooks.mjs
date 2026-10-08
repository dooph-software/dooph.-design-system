// Module customization hook approximating an RSC bundler: any module whose
// first statement is "use client" is replaced by a client-reference stub
// (its exports become opaque objects), everything else evaluates normally
// under the react-server condition.
export async function load(url, context, nextLoad) {
  const r = await nextLoad(url, context);
  if (r.format !== 'module' || r.source == null) return r;
  const src = String(r.source);
  const head = src.replace(/^\uFEFF/, '').trimStart();
  if (!/^["']use client["'];?/.test(head)) return r;
  // collect export names from the trailing `export { a, b as c };` blocks
  const names = new Set();
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const p = part.trim(); if (!p) continue;
      const as = p.split(/\s+as\s+/); names.add((as[1] ?? as[0]).trim());
    }
  }
  for (const m of src.matchAll(/export\s+(?:const|let|var|function|class)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  let out = `const ref = (n) => ({ $$typeof: Symbol.for('react.client.reference'), $$id: ${JSON.stringify(url)} + '#' + n });\n`;
  for (const n of names) out += n === 'default' ? `export default ref('default');\n` : `export const ${n} = ref(${JSON.stringify(n)});\n`;
  globalThis.__clientRefs = (globalThis.__clientRefs ?? 0) + 1;
  return { format: 'module', source: out, shortCircuit: true };
}
