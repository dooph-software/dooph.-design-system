const fs=require('fs');let s=fs.readFileSync('WI-C3.md','utf8');
s=s.replace("\`rg -c -F 'data-","`rg -c -F 'data-").replace("dist/styles.css\` → 1 (Tailwind","dist/styles.css` → 1 (Tailwind");
fs.writeFileSync('WI-C3.md',s);
