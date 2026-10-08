// Load in the Storybook manager page (like story-snapshot.js):
//   (0,eval)(await fetch('/@fs/C:/Users/stick/Github/dooph/dooph-Design-System/docs/audit/_work/scratch/dark-check.js').then(r=>r.text()))
// window.__darkIsland()  → every --ui-* token: value inside a nested .dark island on a light page vs under <html class="dark">.
// window.__darkContrast(filter?) → every story in the Dark theme: text elements whose colour contrast against
//   their effective background is below 3:1 (or invisible), grouped by story. Results in window.__darkReport.
(() => {
  const frame = () => { const fr = document.createElement('iframe'); fr.style.cssText = 'position:fixed;left:0;top:0;width:1200px;height:900px;opacity:0;pointer-events:none;z-index:-1'; document.body.appendChild(fr); return fr; };
  const load = async (fr, url) => {
    await Promise.race([new Promise((r) => { fr.onload = r; fr.src = url; }), new Promise((r) => setTimeout(r, 8000))]);
    const d = fr.contentDocument; const t0 = performance.now();
    while (performance.now() - t0 < 4000) { const r = d?.querySelector('#storybook-root'); if (r && r.children.length) break; await new Promise((r) => setTimeout(r, 50)); }
    await new Promise((r) => setTimeout(r, 300)); return d;
  };
  const tokenNames = (d) => { const out = new Set(); for (const sh of d.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; } const walk = (rs) => { for (const r of rs) { if (r.cssRules) walk(r.cssRules); if (r.style) for (const p of r.style) if (p.startsWith('--ui-')) out.add(p); } }; walk(rules); } return [...out]; };

  window.__darkIsland = async () => {
    const idx = await fetch('/index.json').then((r) => r.json());
    const id = Object.values(idx.entries).find((e) => e.type === 'story').id; const fr = frame();
    const d = await load(fr, `/iframe.html?id=${id}&viewMode=story&globals=theme:light`);
    d.documentElement.classList.remove('dark');
    const island = d.createElement('div'); island.className = 'dark'; const probe = d.createElement('span'); island.appendChild(probe); d.body.appendChild(island);
    const names = tokenNames(d); const w = fr.contentWindow;
    const inIsland = Object.fromEntries(names.map((n) => [n, w.getComputedStyle(probe).getPropertyValue(n).trim()]));
    d.documentElement.classList.add('dark'); island.className = '';
    const mismatch = [];
    for (const n of names) { const v = w.getComputedStyle(probe).getPropertyValue(n).trim(); if (v.replace(/\s+/g, '') !== inIsland[n].replace(/\s+/g, '')) mismatch.push(`${n}: island ${inIsland[n]} | html.dark ${v}`); }
    fr.remove(); return { tokens: names.length, mismatch };
  };

  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p[3] ?? 1]; } const s = c.match(/color\(srgb ([^)]+)\)/); if (s) { const p = s[1].split(/[\s/]+/).filter(Boolean).map(Number); return [p[0] * 255, p[1] * 255, p[2] * 255, p[3] ?? 1]; } return null; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const over = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
  const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };

  window.__darkContrast = async (filter = () => true) => {
    const idx = await fetch('/index.json').then((r) => r.json());
    const ids = Object.values(idx.entries).filter((e) => e.type === 'story' && filter(e.id)).map((e) => e.id);
    const fr = frame(); const report = {}; window.__darkProgress = { done: 0, total: ids.length };
    for (const id of ids) {
      const d = await load(fr, `/iframe.html?id=${id}&viewMode=story&globals=theme:dark`); window.__darkProgress.done++;
      if (!d) continue; const w = fr.contentWindow; const bad = [];
      const pageBg = parse(w.getComputedStyle(d.body).backgroundColor) || [0, 0, 0, 1];
      for (const el of d.querySelectorAll('#storybook-root *')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own) continue; const cs = w.getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.opacity === '0' || el.closest('[aria-hidden=true],.sr-only')) continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        let fg = parse(cs.color); if (!fg) continue;
        const layers = []; for (let p = el; p && p.nodeType === 1; p = p.parentElement) { const bg = parse(w.getComputedStyle(p).backgroundColor); if (bg && bg[3] > 0) { layers.push(bg); if (bg[3] >= 1) break; } }
        let bg = pageBg; for (const l of layers.reverse()) bg = over(l, bg);
        if (fg[3] < 1) fg = over(fg, bg);
        const c = ratio(fg, bg);
        if (c < 3) bad.push(`${c.toFixed(2)} ${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 24)}" ${cs.color} on rgb(${bg.slice(0, 3).map(Math.round).join(',')})`);
      }
      if (bad.length) report[id] = bad;
    }
    fr.remove(); window.__darkReport = report; window.__darkProgress.finished = true; return Object.keys(report).length;
  };
  return 'dark-check loaded';
})();
