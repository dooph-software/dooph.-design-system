const { rollup } = require('C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/rollup');
(async () => {
  const warnings = [];
  const b = await rollup({ input: __dirname + '/a.js', external: ['react'], onwarn: (w) => warnings.push(w.code + ': ' + w.message) });
  const { output } = await b.generate({ format: 'es' });
  console.log('OUTPUT START:', JSON.stringify(output[0].code.slice(0, 60)));
  console.log('WARNINGS:', warnings.join(' | '));
  console.log('rollup version', require('C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/rollup/package.json').version);
})();
