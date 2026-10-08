// WI-C4-20: print the bare text-* classes on a sortable TableHeaderCell's Button,
// and whether each one has a rule in the build's dist/styles.css.
// Usage: node table-header.cjs [buildRoot]   (defaults to the audit build)
const { createRequire } = require('module');
const fs = require('fs');
const B = process.argv[2] || 'C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const req = createRequire(B + '/package.json');
const React = req('react');
const { renderToStaticMarkup } = req('react-dom/server');
const DS = req(B + '/dist/index.cjs');
const html = renderToStaticMarkup(
  React.createElement(DS.TableHeaderCell, { sortDirection: 'none', onSort: () => {} }, 'Name'),
);
const cls = html.match(/<button[^>]*class="([^"]*)"/)[1].split(/\s+/);
const css = fs.readFileSync(B + '/dist/styles.css', 'utf8');
const bare = cls.filter((c) => /^text-/.test(c) && c !== 'text-style-button');
console.log('bare text-colour classes:', bare.join(' ') || '(none)');
for (const c of bare) {
  const hasRule = css.includes('.' + c + '{') || css.includes('.' + c + ' {');
  console.log(`  .${c} has a rule in dist/styles.css: ${hasRule}`);
}
