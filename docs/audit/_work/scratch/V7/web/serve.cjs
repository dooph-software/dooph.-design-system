const http = require('http'), fs = require('fs'), path = require('path');
const roots = { '/dist/': 'C:/Users/stick/Github/dooph/dooph-ds-audit-build/dist/' };
http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  let f = null;
  for (const [p, r] of Object.entries(roots)) if (u.startsWith(p)) f = path.join(r, u.slice(p.length));
  if (!f) f = path.join(__dirname, u === '/' ? 'index.html' : u);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('nf'); }
    const t = f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html';
    res.writeHead(200, { 'content-type': t }); res.end(d);
  });
}).listen(4877, '127.0.0.1', () => console.log('listening 4877'));
