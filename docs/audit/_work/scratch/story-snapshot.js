// Paste into the Storybook manager page (http://localhost:6007) via the browser javascript tool.
// window.__snapRun(tag) snapshots computed layout/colour/motion for every element in every story into window['__snap_'+tag].
// window.__diffSummary(a, b) groups differences by which properties changed and which story families.
window.__snapRun = async function (tag, startAt = 0) {
  const idx = await fetch('/index.json').then((r) => r.json());
  const ids = Object.values(idx.entries).filter((e) => e.type === 'story').map((e) => e.id);
  const out = window['__snap_' + tag] || {}; window['__snap_' + tag] = out; window.__snapProgress = { tag, done: 0, total: ids.length };
  const fr = document.createElement('iframe');
  fr.style.cssText = 'position:fixed;left:0;top:0;width:1200px;height:900px;opacity:0;pointer-events:none;z-index:-1';
  document.body.appendChild(fr);
  window.__snapProps = ['paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','rowGap','columnGap','width','height','color','backgroundColor','borderTopWidth','transitionDuration','transitionTimingFunction','animationDuration','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','fontVariationSettings','fontVariantNumeric','textTransform','whiteSpace'];
  for (const id of ids.slice(startAt)) {
    await Promise.race([new Promise((res) => { fr.onload = res; fr.src = '/iframe.html?id=' + id + '&viewMode=story'; }), new Promise((res) => setTimeout(res, 8000))]);
    const d = fr.contentDocument; if (!d) { out[id] = ["LOAD-FAILED"]; window.__snapProgress.done++; continue; } const t0 = performance.now();
    while (performance.now() - t0 < 4000) { const r = d.querySelector('#storybook-root'); if (r && r.children.length) break; await new Promise((r) => setTimeout(r, 50)); }
    await new Promise((r) => setTimeout(r, 250));
    const rows = []; const root = d.querySelector('#storybook-root');
    if (root) { let i = 0; for (const el of root.querySelectorAll('*')) { const cs = fr.contentWindow.getComputedStyle(el); rows.push(i++ + ':' + el.tagName + ':' + window.__snapProps.map((p) => cs[p]).join('|')); } }
    out[id] = rows; window.__snapProgress.done++;
  }
  fr.remove(); window.__snapProgress.finished = true;
};
window.__diffSummary = function (a, b) {
  const P = window.__snapProps; const A = window['__snap_' + a], B = window['__snap_' + b];
  const kinds = {}; const counts = [];
  for (const id of Object.keys(A)) {
    const x = A[id], y = B[id] || [];
    if (x.length !== y.length) { counts.push(id + ' ' + x.length + '→' + y.length); continue; }
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) {
      const av = x[i].split(':').slice(2).join(':').split('|'), bv = y[i].split(':').slice(2).join(':').split('|');
      const key = P.filter((p, k) => av[k] !== bv[k]).map((p) => p + ' ' + av[P.indexOf(p)] + '→' + bv[P.indexOf(p)]).join(' ; ');
      (kinds[key] = kinds[key] || new Set()).add(id.split('--')[0]);
    }
  }
  return JSON.stringify({ counts, kinds: Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, [...v]])) });
};
'snapshot harness loaded';
