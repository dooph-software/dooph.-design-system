// Run with: NODE_ENV=production node --conditions=react-server <this> <distDir>
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const dist = process.argv[2];
const chunks = process.argv.slice(3);
for (const c of chunks) {
  try {
    await import(pathToFileURL(path.join(dist, c)).href);
    console.log(c, 'OK (module evaluated)');
  } catch (e) {
    console.log(c, 'FAIL', e.constructor.name + ': ' + String(e.message).split('\n')[0]);
  }
}
