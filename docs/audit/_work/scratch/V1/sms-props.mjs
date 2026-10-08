// Pretend MorphRotationShape's chunk were client-marked (post stamp-fix):
// render ShapeMorphSpinner and inspect the props it hands the client reference.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const dist = process.argv[2];
const m = await import(pathToFileURL(path.join(dist, 'chunk-NKTWAFXA.js')).href);
const el = m.ShapeMorphSpinner({});
const t = el.type;
console.log('element type is client reference:', t?.$$typeof === Symbol.for('react.client.reference'));
console.log('shapes prop:', el.props.shapes.map((s) => `${typeof s}:${s.name}:clientRef=${s?.$$typeof === Symbol.for('react.client.reference')}`).join(', '));
