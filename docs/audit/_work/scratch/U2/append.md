
### U2-F8: Half the tarball is unreachable per-module stubs, and every CJS sourcemap maps the output file to itself by an absolute build-machine path
- severity: S3
- category: build-packaging
- rules: []
- scope: consumer-visible
- confidence: plausible
- verified_by: "docs/audit/_work/pack.txt: 1000 dist/chunk-* files, 502 non-chunk .js/.cjs + 502 non-chunk maps (251 entries ×2 incl. index), 502 .d.ts/.d.cts. dist/index.js imports chunks directly (dist/index.js:1-126, e.g. `from \"./chunk-JXNRCALT.js\"`), never ./components/**. grep -l '\"sources\":\\[\"c:' dist/*.cjs.map | wc -l → 251 (all top-level CJS maps); node scan of all 501 .cjs.map → 501 have one source = the .cjs file itself; 212/501 ESM maps point at ../src with sourcesContent."
- locations:
  - tsup.config.ts:33
  - tsup.config.ts:46
  - package.json:20-28
  - scripts/add-use-client.mjs:108
- evidence: |
    tsup.config.ts:33  entry: ['src/**/*.{ts,tsx}', '!src/**/*.stories.tsx', '!src/**/*.test.{ts,tsx}'],
    tsup.config.ts:46  sourcemap: true,
    package.json:20-28 "exports": { ".": {types, import, require}, "./styles.css": …, "./theme.css": … }   (no "./components/*" or "./utils/*" subpath)
    dist/index.cjs.map:            "sources":["c:\\Users\\stick\\Github\\dooph\\dooph-ds-audit-build\\dist\\index.cjs"]
    dist/components/Button/Button.cjs.map: "sources":["c:\\Users\\stick\\…\\dist\\components\\Button\\Button.cjs"]
    add-use-client.mjs:108  writeFileSync(full, `"${DIRECTIVE}";\n${contents}`);   (the paired .map is not updated)
- impact: (1) The `exports` map exposes only ".", so the 500 per-module `.js`/`.cjs` entry stubs such as `dist/utils/cn.js` and `dist/utils/color.js` (and their 500 maps) cannot be imported by a consumer, and nothing inside the package imports them either. They are ~40% of the 2519 packed files. Their esbuild-preserved `"use client"` lines (40 ESM stubs) also make a spot check of `dist/components/Input/Input.js` look correct while the chunk that carries the code is unstamped (U2-F1). (2) CJS maps give `require` consumers no route back to source (a stack trace resolves to the same compiled chunk) and embed the absolute path of whatever machine ran the build, the CI runner's for published versions. (3) The stamp prepends a line to 24+24 chunks without shifting their maps, so by construction every mapping in those chunks is one line off.
- recommendation: Decide whether per-module files are an API. If not, stop emitting the `.js`/`.cjs` stubs, or document that only the `.d.ts` side is needed. Either drop CJS sourcemaps or fix their generation, and make the stamp shift the map (prefix `;` to `mappings`) when it prepends.
- breaking: none
- contract: n/a
- remediation: tbd
- related: [U2-F1]
