import { pathToFileURL } from 'node:url';
const target = process.argv[2];
try {
  const m = await import(pathToFileURL(target).href);
  console.log('root import OK; exports:', Object.keys(m).length);
} catch (e) {
  console.log('root import FAIL', e.constructor.name + ': ' + String(e.message).split('\n')[0]);
}
