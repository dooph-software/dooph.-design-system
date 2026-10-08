const B='C:/Users/stick/Github/dooph/dooph-ds-audit-build/';
const React=require(B+'node_modules/react');
const {renderToStaticMarkup}=require(B+'node_modules/react-dom/server');
const ds=require(B+'dist/index.cjs');
for (const v of ['flat','spokes']) console.log(v, renderToStaticMarkup(React.createElement(ds.LoadingSpinner,{variant:v,size:'md'})).slice(0,260));
console.log('PI', renderToStaticMarkup(React.createElement(ds.ProgressIndicator,{progress:0.5})).slice(0,220));
