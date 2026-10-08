const path=require('path');
const B='C:/Users/stick/Github/dooph/dooph-ds-audit-build';
const React=require(B+'/node_modules/react');
const {renderToStaticMarkup}=require(B+'/node_modules/react-dom/server');
const ds=require(B+'/dist/index.cjs');
const out=[1,0.5].map(sw=>renderToStaticMarkup(React.createElement(ds.TagIcon,{color:'red',size:240,strokeWidth: sw===1?undefined:sw})));
const html=`<!doctype html><html><head><style>:root{--ui-icon-stroke-width:2}body{color:rgb(0,0,255);background:#fff;margin:0}</style></head><body>${out.join('')}</body></html>`;
require('fs').writeFileSync(path.join(__dirname,'tag.html'),html);
console.log(out[0]);
