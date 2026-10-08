import { pathToFileURL } from 'node:url';
import path from 'node:path';
const [dist, ...pairs] = process.argv.slice(2);
for (const pair of pairs) {
  const [chunk, n] = pair.split(':');
  let m;
  try { m = await import(pathToFileURL(path.join(dist, chunk)).href); }
  catch (e) { console.log(`${n} [${chunk}] module-eval FAIL`, e.constructor.name + ': ' + String(e.message).split('\n')[0]); continue; }
  const C = m[n];
  const kind = C?.$$typeof === Symbol.for('react.client.reference') ? 'client-reference' : C?.$$typeof === Symbol.for('react.forward_ref') ? 'forwardRef' : typeof C;
  if (kind === 'client-reference') { console.log(n, '-> client reference'); continue; }
  const fn = kind === 'forwardRef' ? (p) => C.render(p, null) : C;
  try { fn({ children: 'x', value: '1', length: 4, changeKey: 1, text: 'a', digits: '12' }); console.log(`${n} [${chunk}] (${kind}) render call: no TypeError from missing React API`); }
  catch (e) { console.log(`${n} [${chunk}] (${kind}) render FAIL`, e.constructor.name + ': ' + String(e.message).split('\n')[0]); }
}
