const fs=require('fs');let s=fs.readFileSync('WI-C3.md','utf8');
const a='`rg -c -F "data-[state=unchecked]:[&:not" dist/styles.css` → 1 (the escaped selector exists).';
const b=String.raw`\`rg -c -F 'data-\[state\=unchecked\]\:\[\&\:not' dist/styles.css\` → 1 (Tailwind's escaped selector for the new class exists).`;
if(!s.includes(a)){console.log('nf');process.exit(1)} s=s.replace(a,b);fs.writeFileSync('WI-C3.md',s);console.log('ok');
