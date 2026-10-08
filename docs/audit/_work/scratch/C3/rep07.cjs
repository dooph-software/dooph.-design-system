const fs=require('fs');
const p='final/WI-C3.md'; let s=fs.readFileSync(p,'utf8');
const nb=fs.readFileSync('scratch/C3/blk07.md','utf8');
const a=s.indexOf('### WI-C3-07:'); const b=s.indexOf('### WI-C3-08:');
if(a<0||b<0){console.log('nf');process.exit(1)}
s=s.slice(0,a)+nb+s.slice(b); fs.writeFileSync(p,s); console.log('ok');
