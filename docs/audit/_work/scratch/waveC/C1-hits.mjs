import fs from 'node:fs'; import path from 'node:path';
const files=[];const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.tsx?$/.test(e.name)&&!/\.stories\./.test(e.name))files.push(p.split(path.sep).join('/'));}};walk('src');
const re2=/-\[-?[0-9.]+(?:px|rem)\]/g;
const re3=/(?<![\w-])-?(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)-\d+(?:\.5)?(?![\w-])/g;
for(const f of files){if(f==='src/components/Icons/index.ts')continue;const L=fs.readFileSync(f,'utf8').split('\n');L.forEach((l,i)=>{const a=[...(l.match(re2)||[]).map(x=>'m2:'+x),...(l.match(re3)||[]).map(x=>'m3:'+x)];if(a.length)console.log(`${f}:${i+1} ${a.join(' ')}  | ${l.trim().slice(0,140)}`);});}
