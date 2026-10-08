import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
const dist = path.resolve(process.argv[2]);
const pkg = await import(pathToFileURL(path.join(dist, 'index.js')).href);
const require = createRequire(path.join(dist, 'index.js'));
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { cn, HeroBodyText, HeroButtonText, BodyText, SubheadingText, MonoText } = pkg;
for (const c of ['hero-body','hero-button','body','subheading','mono','hero','title','label','heading','button'])
  console.log(`cn('text-style-${c}','text-text') ->`, JSON.stringify(cn(`text-style-${c}`, 'text-text')));
for (const [n, C] of Object.entries({ HeroBodyText, HeroButtonText, BodyText, SubheadingText, MonoText }))
  console.log(n, renderToStaticMarkup(React.createElement(C, { className: 'text-text-secondary' }, 'x')));
