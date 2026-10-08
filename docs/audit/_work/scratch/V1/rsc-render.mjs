// import package root under the approximation, then call selected components'
// render functions directly (server-side render of a non-client component).
import { pathToFileURL } from 'node:url';
const [target, ...names] = process.argv.slice(2);
let m;
try { m = await import(pathToFileURL(target).href); console.log('root import OK'); }
catch (e) { console.log('root import FAIL', e.constructor.name + ': ' + String(e.message).split('\n')[0]); process.exit(0); }
for (const n of names) {
  const C = m[n];
  const kind = C?.$$typeof === Symbol.for('react.client.reference') ? 'client-reference' : C?.$$typeof === Symbol.for('react.forward_ref') ? 'forwardRef' : typeof C;
  if (kind === 'client-reference') { console.log(n, '-> client reference (OK in RSC)'); continue; }
  const fn = kind === 'forwardRef' ? (p) => C.render(p, null) : C;
  try { fn({ children: 'x', value: '1', length: 4, shapes: [], changeKey: 1 }); console.log(n, `(${kind}) render call returned without TypeError`); }
  catch (e) { console.log(n, `(${kind}) render FAIL`, e.constructor.name + ': ' + String(e.message).split('\n')[0]); }
}
