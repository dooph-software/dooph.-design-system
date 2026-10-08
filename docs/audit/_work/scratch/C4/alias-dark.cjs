// C4 (F-019): re-derive :root alias tokens that depend (directly or transitively) on a token .dark changes,
// but are not themselves re-declared in .dark. Comment-blanked (line numbers preserved).
// The var() regex tolerates whitespace/newlines inside var( ... ) — tokens.css:62-64 wraps one.
const fs=require('fs'),path=require('path');
const file=path.resolve(__dirname,'../../../../../src/styles/tokens.css');
const raw=fs.readFileSync(file,'utf8');
const src=raw.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' '));
const lineOf=i=>src.slice(0,i).split('\n').length;
const rootStart=src.indexOf('{',src.indexOf(':root'))+1, darkHead=src.indexOf('.dark {');
const darkStart=src.indexOf('{',darkHead)+1, darkEnd=src.lastIndexOf('}');
const parse=(a,b)=>{const m=new Map();const re=/(--[\w-]+)\s*:\s*([^;]+);/g;re.lastIndex=a;let x;while((x=re.exec(src))&&x.index<b){m.set(x[1],{v:x[2].replace(/\s+/g,' ').replace(/\(\s+/g,'(').replace(/\s+\)/g,')').trim(),line:lineOf(x.index)});}return m;};
const R=parse(rootStart,darkHead), D=parse(darkStart,darkEnd);
const VAR=/var\(\s*(--[\w-]+)\s*\)/g;
const changed=k=>D.has(k)&&D.get(k).v!==R.get(k).v;
const via=(k,seen=new Set())=>{const v=(R.get(k)||{}).v||'';for(const m of v.matchAll(VAR)){const t=m[1];if(seen.has(t))continue;seen.add(t);if(changed(t))return [t];const p=via(t,seen);if(p)return [t,...p];}return null;};
const resolve=(k,mode,d=0)=>{const ent=(mode==='dark'&&D.has(k))?D.get(k):R.get(k);if(!ent||d>10)return '?';return ent.v.replace(VAR,(_,t)=>resolve(t,mode,d+1));};
const miss=[...R.keys()].filter(k=>!D.has(k)&&via(k));
console.log(`:root decls ${R.size}, .dark decls ${D.size}, dark-changed ${[...D.keys()].filter(changed).length}`);
console.log(`alias tokens depending on a dark-changed token, NOT re-declared in .dark: ${miss.length}`);
console.log('token|root line|root value|depends on (chain)|island (light) value|dark value');
for(const k of miss){const e=R.get(k);console.log([k,e.line,e.v,via(k).join(' -> '),resolve(k,'light'),resolve(k,'dark')].join('|'));}
const redecl=[...D.keys()].filter(k=>R.has(k)&&!changed(k)&&/var\(/.test(R.get(k).v));
console.log(`\nalias lines re-declared identically in .dark: ${redecl.length}`);
for(const k of redecl)console.log(`${k}|root ${R.get(k).line}|dark ${D.get(k).line}|${R.get(k).v}|via ${(via(k)||[]).join(' -> ')}`);
const lit=[...D.keys()].filter(k=>R.has(k)&&!changed(k)&&!/var\(/.test(R.get(k).v));
console.log(`\nliteral lines re-declared identically in .dark: ${lit.length}`);
for(const k of lit)console.log(`${k}|root ${R.get(k).line}|dark ${D.get(k).line}|${R.get(k).v}`);
