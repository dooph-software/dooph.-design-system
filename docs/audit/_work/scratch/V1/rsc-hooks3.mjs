// hooks2 + force-stub one extra module (MorphRotationShape chunk) as if it were stamped
import * as base from './rsc-hooks2.mjs';
export const resolve = base.resolve;
export async function load(url, context, nextLoad) {
  if (url.endsWith('/chunk-PWLXGSXJ.js')) {
    return { format: 'module', shortCircuit: true, source: `export const MorphRotationShape = { $$typeof: Symbol.for('react.client.reference'), $$id: 'MorphRotationShape' };` };
  }
  return base.load(url, context, nextLoad);
}
