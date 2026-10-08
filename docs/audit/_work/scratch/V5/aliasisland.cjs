// V5: :root tokens whose value references another token that .dark changes, but which .dark does not itself re-declare
// (these resolve to the LIGHT value inside a .dark subtree island under a light root).
const fs=require('fs');const path=require('path');
const src=fs.readFileSync(path.resolve(__dirname,'../../../../../src/styles/tokens.css'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
const rootBody=src.slice(src.indexOf('{',src.indexOf(':root'))+1, src.indexOf('.dark {'));
const darkBody=src.slice(src.indexOf('{',src.indexOf('.dark {'))+1);
const parse=b=>new Map([...b.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
const R=parse(rootBody), D=parse(darkBody);
const changed=k=>D.has(k)&&D.get(k)!==R.get(k);
const dependsOnChanged=(k,seen=new Set())=>{const v=R.get(k)||'';for(const m of v.matchAll(/var\((--[\w-]+)/g)){const t=m[1];if(seen.has(t))continue;seen.add(t);if(changed(t)||dependsOnChanged(t,seen))return true;}return false;};
const miss=[...R.keys()].filter(k=>!D.has(k)&&dependsOnChanged(k));
console.log('root tokens that alias a dark-changed token but are not re-declared in .dark:',miss.length);console.log(miss.join('\n'));
