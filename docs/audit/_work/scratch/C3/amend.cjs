const fs = require('fs');
const p = 'final/WI-C3.md';
let L = fs.readFileSync(p, 'utf8').split('\n');
function setLine(n, startsWith, text) {
  const i = n - 1;
  if (!L[i].trimStart().startsWith(startsWith)) { console.log('mismatch at', n, L[i].slice(0, 60)); process.exit(1); }
  L[i] = text;
}
// WI-C3-10 step 2: substring edits only (WI-C4-14 rewrites the disabled clause, WI-C5-10 adds a line after :9)
setLine(535, '- [ ] 2. CodeDigitInput.tsx:8-9',
  "  - [ ] 2. CodeDigitInput.tsx:8-9, substrings only (WI-C4-14 rewrites the `disabled` clause on the same lines and WI-C5-10 adds a line after :9; leave both untouched): `paints error-primary border` → `paints danger-primary border`, and `focus uses brand focus ring.` → `focus uses the prominent focus ring.`");
// WI-C3-04 step 4: note WI-C2-15 rewords :50 first
const i241 = 241 - 1;
if (!L[i241].includes('`spinnerGeometry.ts`: delete `SPINNER_ANIM_DURATION` (:48-52)')) { console.log('mismatch 241'); process.exit(1); }
L[i241] = L[i241].replace('delete `SPINNER_ANIM_DURATION` (:48-52)', 'delete `SPINNER_ANIM_DURATION` and its JSDoc (:48-52; WI-C2-15 may already have reworded :50 — delete whatever text is there)');
// WI-C3-09 risk: overlapping WIs on dooph-component-tokens.css
const i438 = 438 - 1;
if (!L[i438].startsWith('- risk: low — comments only')) { console.log('mismatch 438'); process.exit(1); }
L[i438] = L[i438] + ' WI-C4-04 and WI-C4-07 later edit dooph-component-tokens.css:126-159 and WI-C4-12 edits sync-theme.mjs:145-148; land this P1 WI first and they re-anchor on its comment text.';
fs.writeFileSync(p, L.join('\n'));
console.log('ok');
