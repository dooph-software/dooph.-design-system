/*
 * surface.mjs — shared TS-API and CSS extraction for the design system's public
 * surface. Used by scripts/generate-docs.mjs (reads SOURCE: src/index.ts with
 * the repo tsconfig) and by scripts/surface.mjs (reads a BUILT tree:
 * dist/index.d.ts), whose output scripts/surface-diff.mjs compares.
 *
 * ## behavior
 * - createSourceProgram / createDistProgram build a program (plus an optional
 *   virtual probe file that never touches disk) and return { program, checker,
 *   sf, probe }. probeSpecs() lists what to probe; readProbe() reads it back.
 * - extractExports lists every export of the entry with its kind and module
 *   (the folder under components/, else the file path under the module base).
 * - extractProps returns a component's OWN props (declared in the tree's own
 *   files, not node_modules), each read from its declarations' type nodes, plus
 *   a summary of the inherited ones. extractPropDocs and symbolDoc add JSDoc
 *   first sentences; findRenderFunction + extractDefaults (source programs
 *   only) read the destructuring defaults of a component's render function.
 * - extractConstEntries, extractType, extractFunction: consts flattened to
 *   key → value text, exported types, function signatures.
 * - walkCss / extractTokens / extractClasses read stylesheets without comments;
 *   parseCssDecls keeps comments and line numbers for docs.
 *
 * ## constraints
 * - Member and prop types are read from each OWN declaration's type node, never
 *   from the merged symbol: the merged type is subtype-reduced (`DsColor`, a
 *   literal union | `string & {}`, prints as `string`) or taken from one arm of a
 *   props union. Reading the symbol re-introduces false types in every output.
 * - Output is deterministic: every map is key-sorted and every multi-valued text
 *   is sorted, so generated docs diff cleanly and `--check` is stable.
 * - The surface JSON scripts/surface.mjs writes must stay byte-identical for a
 *   given tree: a migration inventory diffs surfaces, and a surface saved
 *   earlier must still compare equal to one written now, so changing an
 *   existing function's output shows up as false differences. Add a new
 *   function or an opt-in parameter instead.
 */
import { existsSync } from 'node:fs';
import { resolve, relative, sep, dirname } from 'node:path';
import { createRequire } from 'node:module';

// ── TypeScript loading ──────────────────────────────────────────────────────
// Prefer the tree's own compiler so the result matches what that tree ships.
export function loadTs(treeDir) {
  const req = createRequire(resolve(treeDir, 'package.json'));
  try {
    return req('typescript');
  } catch {
    return createRequire(import.meta.url)('typescript');
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
export const norm = (p) => p.split(sep).join('/');
export const squash = (s) => s.replace(/\s+/g, ' ').trim();

export function isOwnFile(fileName, treeDir) {
  const f = norm(resolve(fileName));
  const t = norm(resolve(treeDir));
  return f.startsWith(t + '/') && !f.includes('/node_modules/');
}

// The component/module folder an export is declared in, e.g. "Button", "utils/cn".
// moduleBase: the directory module paths are relative to (dist/ or src/).
export function moduleOf(decl, moduleBase) {
  if (!decl) return '?';
  const rel = norm(relative(moduleBase, decl.getSourceFile().fileName));
  const m = rel.match(/^components\/([^/]+)\//);
  if (m) return m[1];
  return rel.replace(/\.d\.ts$|\.tsx?$/, '');
}

export function packageOf(fileName) {
  const f = norm(fileName);
  const i = f.lastIndexOf('/node_modules/');
  if (i < 0) return null;
  const rest = f.slice(i + '/node_modules/'.length).split('/');
  return rest[0].startsWith('@') ? `${rest[0]}/${rest[1]}` : rest[0];
}

export function isDeprecated(ts, sym) {
  return (sym.getJsDocTags?.() ?? []).some((t) => t.name === 'deprecated');
}

export function sortObj(o) {
  return Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

// ── Program ─────────────────────────────────────────────────────────────────
// probeNames: component names to resolve through React's ComponentProps<typeof X>
// in a virtual probe file (lets a generic/polymorphic component's inherited
// props resolve at its type parameters' constraints). The probe never touches disk.
export const PROBE = '__surface_probe__.ts';

function buildProgram(ts, { rootDir, entry, options, probeImport, probeNames = [], oldProgram }) {
  if (!existsSync(entry)) throw new Error(`missing ${entry}`);
  const probePath = norm(resolve(rootDir, PROBE));
  const probeText =
    `import type { ComponentProps } from 'react';\nimport * as DS from '${probeImport}';\n` +
    probeNames
      .map((n) =>
        typeof n === 'string'
          ? `export type P_${n} = ComponentProps<typeof DS.${n}>;`
          : n.isType
            ? `export type T_${n.name} = DS.${n.name}<${n.args.join(', ')}>;`
            : `export type P_${n.name} = ComponentProps<typeof DS.${n.name}<${n.args.join(', ')}>>;`,
      )
      .join('\n');
  const host = ts.createCompilerHost(options);
  const isProbe = (f) => norm(resolve(f)) === probePath;
  const { getSourceFile, fileExists, readFile } = host;
  host.getSourceFile = (f, lv, ...rest) =>
    isProbe(f) ? ts.createSourceFile(f, probeText, lv, true) : getSourceFile.call(host, f, lv, ...rest);
  host.fileExists = (f) => isProbe(f) || fileExists.call(host, f);
  host.readFile = (f) => (isProbe(f) ? probeText : readFile.call(host, f));
  const roots = probeNames.length ? [entry, probePath] : [entry];
  const program = ts.createProgram(roots, options, host, oldProgram);
  const checker = program.getTypeChecker();
  const sf = program.getSourceFile(entry);
  const probe = probeNames.length ? program.getSourceFile(probePath) : null;
  return { program, checker, sf, probe };
}

// A BUILT tree: dist/index.d.ts with fixed options (what a consumer compiles).
export function createDistProgram(ts, treeDir, probeNames = []) {
  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    types: [],
  };
  return buildProgram(ts, {
    rootDir: treeDir,
    entry: resolve(treeDir, 'dist/index.d.ts'),
    options,
    probeImport: './dist/index.js',
    probeNames,
  });
}

// SOURCE: src/index.ts with the repo's own tsconfig compiler options. No build
// needed, so lint can run it. Only the entry (and what it imports) is loaded.
export function createSourceProgram(ts, repoDir, probeNames = [], oldProgram) {
  const cfgPath = resolve(repoDir, 'tsconfig.json');
  const cfg = ts.readConfigFile(cfgPath, ts.sys.readFile);
  if (cfg.error) throw new Error(ts.flattenDiagnosticMessageText(cfg.error.messageText, '\n'));
  const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, dirname(cfgPath));
  const options = { ...parsed.options, noEmit: true, declaration: false, declarationMap: false, sourceMap: false };
  return buildProgram(ts, {
    rootDir: repoDir,
    entry: resolve(repoDir, 'src/index.ts'),
    options,
    probeImport: './src/index',
    probeNames,
    oldProgram,
  });
}

// What to probe, from a first-pass export list: components (generic ones at
// their type parameters' defaults, as an instantiation expression typeof X<…>;
// otherwise ComponentProps infers the constraint and the inherited DOM props
// vanish) and generic exported types at their defaults.
export function probeSpecs(ts, checker, exps) {
  const names = exps
    .filter((e) => e.kind === 'component')
    .map((e) => {
      const tps = e.valueType.getCallSignatures()[0]?.typeParameters ?? [];
      if (!tps.length) return e.name;
      const args = tps.map((tp) => {
        const d = checker.getDefaultFromTypeParameter(tp) ?? checker.getBaseConstraintOfType(tp);
        return d ? unqualify(checker.typeToString(d, undefined, TF(ts))) : 'any';
      });
      return { name: e.name, args };
    });
  for (const e of exps) {
    if (!(e.kind === 'type' || e.alsoType)) continue;
    const decl = e.sym.getDeclarations()?.find((d) => ts.isTypeAliasDeclaration(d) || ts.isInterfaceDeclaration(d));
    if (!decl?.typeParameters?.length) continue;
    const args = decl.typeParameters.map((tp) => (tp.default ? tp.default.getText() : tp.constraint ? tp.constraint.getText() : 'any'));
    names.push({ name: e.name, args, isType: true });
  }
  return names;
}

export function readProbe(checker, probe) {
  const probeTypes = new Map();
  const probeTypeAliases = new Map();
  if (probe) {
    for (const s of checker.getExportsOfModule(checker.getSymbolAtLocation(probe))) {
      const n = s.getName();
      if (n.startsWith('P_')) probeTypes.set(n.slice(2), checker.getDeclaredTypeOfSymbol(s));
      else if (n.startsWith('T_')) probeTypeAliases.set(n.slice(2), checker.getDeclaredTypeOfSymbol(s));
    }
  }
  return { probeTypes, probeTypeAliases };
}

export const TF = (ts) => ts.TypeFormatFlags.NoTruncation;

// typeToString qualifies out-of-scope names as import("<abs path>").Name; the
// path differs per tree, so drop the qualifier to keep the two trees comparable.
// The React namespace prefix depends only on how the .d.ts imported React
// (`import * as react` vs named imports), so it is dropped too.
export const unqualify = (s) => s.replace(/import\("[^"]*"\)\./g, '').replace(/\b(?:react|React)\./g, '');

export function typeText(ts, checker, type, node) {
  return unqualify(squash(checker.typeToString(type, node, TF(ts))));
}

// Expanded text: unwraps one alias level so a change to a union alias
// (e.g. ButtonSize) shows up even when the prop still says "ButtonSize".
// Only unions of literal / primitive members are expanded (sorted); anything
// with object members (ReactNode, …) keeps its plain text.
export function expandedText(ts, checker, type, node) {
  if (type.isUnion()) {
    const F = ts.TypeFlags;
    const simple = F.Literal | F.BooleanLiteral | F.Undefined | F.Null | F.String | F.Number | F.Boolean | F.BigInt | F.TemplateLiteral;
    const isSimple = (t) => t.flags & simple || (t.isIntersection() && t.types.some((x) => x.flags & F.String));
    if (!type.types.every(isSimple)) return typeText(ts, checker, type, node);
    const parts = type.types.map((t) => typeText(ts, checker, t, node));
    return [...new Set(parts)].sort().join(' | ');
  }
  // An alias that expands to an object literal (Omit<…>, HTMLAttributes) is
  // kept by name: its expansion lists members in checker order, which varies
  // between programs and would show as a false change.
  const exp = unqualify(squash(checker.typeToString(type, node, TF(ts) | ts.TypeFormatFlags.InTypeAlias)));
  return exp.startsWith('{') ? typeText(ts, checker, type, node) : exp;
}

// ── Export classification ───────────────────────────────────────────────────
export function looksLikeComponent(ts, checker, name, type, node) {
  if (!/^[A-Z]/.test(name)) return false;
  const sigs = type.getCallSignatures();
  if (!sigs.length) return false;
  const ret = typeText(ts, checker, sigs[0].getReturnType(), node);
  if (/ReactNode|Element|ReactElement|JSX/.test(ret)) return true;
  const t = typeText(ts, checker, type, node);
  return /ExoticComponent|FC<|FunctionComponent|ComponentType/.test(t);
}

// moduleBase defaults to <treeDir>/dist (the built-tree layout).
export function extractExports(ts, checker, sf, treeDir, moduleBase = resolve(treeDir, 'dist')) {
  const modSym = checker.getSymbolAtLocation(sf);
  const out = [];
  for (const exp of checker.getExportsOfModule(modSym)) {
    const name = exp.getName();
    const sym = exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp;
    const decls = sym.getDeclarations() ?? [];
    const decl = decls[0];
    const isValue = !!(sym.flags & ts.SymbolFlags.Value);
    const isType = !!(sym.flags & (ts.SymbolFlags.Type | ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias));
    let kind;
    let valueType;
    if (isValue) {
      const valueDecl = sym.valueDeclaration ?? decl;
      valueType = checker.getTypeOfSymbolAtLocation(sym, valueDecl ?? sf);
      if (looksLikeComponent(ts, checker, name, valueType, valueDecl)) kind = 'component';
      else if (valueType.getCallSignatures().length) kind = 'function';
      else if (sym.flags & ts.SymbolFlags.Class) kind = 'class';
      else kind = 'const';
    } else if (isType) {
      kind = 'type';
    } else {
      kind = 'other';
    }
    out.push({
      name,
      kind,
      alsoType: isValue && isType,
      module: moduleOf(sym.valueDeclaration ?? decl, moduleBase),
      deprecated: isDeprecated(ts, sym),
      sym,
      valueType,
    });
  }
  return out;
}

// ── Component props ─────────────────────────────────────────────────────────
// Own props = properties of the props parameter whose declarations live in the
// tree's own sources, not node_modules. Inherited props are summarised only by
// the packages they come from.
// probeType: the type of ComponentProps<typeof X> from the probe file, used only
// to summarise inherited (non-own) props; own props always come from the first
// parameter of the call signature.
export function extractProps(ts, checker, exp, treeDir, probeType) {
  const node = exp.sym.valueDeclaration ?? exp.sym.getDeclarations()?.[0];
  const sigs = exp.valueType.getCallSignatures();
  const props = {};
  const generic = sigs.some((s) => s.typeParameters?.length);
  const isOwnSym = (p) => (p.getDeclarations() ?? []).some((d) => isOwnFile(d.getSourceFile().fileName, treeDir));

  // Inherited props: names, and the packages that declare them.
  const inheritedFrom = new Set();
  const inherited = new Set();
  const inhSources = probeType
    ? [probeType]
    : sigs.map((s) => s.getParameters()[0]).filter(Boolean).map((p) => checker.getTypeOfSymbolAtLocation(p, node));
  // The `ref` an element accepts is inherited (RefAttributes<…>), so it is not
  // an own prop; its element type is recorded separately so a ref retype
  // (HTMLElement → HTMLButtonElement) still shows in the diff.
  let refType = null;
  for (const t of inhSources) {
    for (const p of checker.getPropertiesOfType(checker.getApparentType(t))) {
      if (p.getName() === 'ref' && refType === null) refType = typeText(ts, checker, checker.getTypeOfSymbolAtLocation(p, node), node);
      if (isOwnSym(p)) continue;
      inherited.add(p.getName());
      for (const d of p.getDeclarations() ?? []) {
        const pkg = packageOf(d.getSourceFile().fileName);
        if (pkg) inheritedFrom.add(pkg);
      }
    }
  }

  // A prop's type is read from each of its OWN declarations' type nodes, not
  // from the merged symbol: when props are a discriminated union (Slider's
  // paint props, Input's variants) or a component has several call
  // signatures (CTAButton), the checker synthesises one property whose type
  // is subtype-reduced (`DsColor | DsColor` → `string`) or taken from one arm
  // only. Distinct declared types are kept side by side, joined by " / ". A
  // prop is optional if it is optional in any arm or missing from any
  // signature. Props with no type node (mapped types such as cva's
  // VariantProps) fall back to the symbol's type.
  const acc = {};
  const perSig = [];
  for (const sig of sigs) {
    const param = sig.getParameters()[0];
    if (!param) continue;
    const pType = checker.getTypeOfSymbolAtLocation(param, node);
    const all = checker.getPropertiesOfType(checker.getApparentType(pType));
    const names = new Set();
    for (const p of all) {
      if (!isOwnSym(p)) continue;
      const name = p.getName();
      names.add(name);
      const a = (acc[name] ??= { types: new Set(), expanded: new Set(), declared: new Set(), optional: false, deprecated: false });
      const ownDecls = (p.getDeclarations() ?? []).filter((d) => isOwnFile(d.getSourceFile().fileName, treeDir));
      const typed = ownDecls.filter((d) => d.type);
      if (typed.length) {
        for (const d of typed) {
          const t = checker.getTypeFromTypeNode(d.type);
          a.types.add(typeText(ts, checker, t, d));
          a.expanded.add(expandedText(ts, checker, t, d));
          a.declared.add(squash(d.type.getText()));
          if (d.questionToken) a.optional = true;
        }
      } else {
        const t = checker.getTypeOfSymbolAtLocation(p, node);
        a.types.add(typeText(ts, checker, t, node));
        a.expanded.add(expandedText(ts, checker, t, node));
      }
      if (p.flags & ts.SymbolFlags.Optional) a.optional = true;
      if (isDeprecated(ts, p)) a.deprecated = true;
    }
    perSig.push(names);
  }
  for (const [name, a] of Object.entries(acc)) {
    if (perSig.some((s) => !s.has(name))) a.optional = true;
    const join = (s) => [...s].sort().join(' / ');
    props[name] = {
      type: join(a.types),
      declared: a.declared.size ? join(a.declared) : null,
      expanded: join(a.expanded),
      optional: a.optional,
      deprecated: a.deprecated,
    };
  }
  return {
    signatures: sigs.length,
    generic,
    refType,
    props: sortObj(props),
    inheritedFrom: [...inheritedFrom].sort(),
    inheritedCount: inherited.size,
    inherited: [...inherited].sort(),
  };
}

// ── Docs (JSDoc) ────────────────────────────────────────────────────────────
// First sentence of a prose comment: up to the first . ! or ? followed by
// whitespace or the end, skipping common abbreviations. Whitespace is squashed.
const ABBREV = /(?:\b(?:e\.g|i\.e|etc|vs|cf|approx|incl)|\b[A-Z])\.$/i;
export function firstSentence(text) {
  const s = squash(text ?? '');
  const re = /[.!?](?=\s|$)/g;
  let m;
  while ((m = re.exec(s))) {
    const upTo = s.slice(0, m.index + 1);
    if (m[0] === '.' && ABBREV.test(upTo)) continue;
    return upTo;
  }
  return s;
}

function jsDocText(ts, decl) {
  const out = [];
  for (const j of ts.getJSDocCommentsAndTags(decl)) {
    if (!ts.isJSDoc(j)) continue;
    const t = ts.getTextOfJSDocComment(j.comment);
    if (t && t.trim()) out.push(t);
  }
  return out.join('\n');
}

// JSDoc first sentence of each OWN prop, read per own declaration (union arms
// may document a prop differently; distinct sentences are joined by " / ").
export function extractPropDocs(ts, checker, exp, treeDir) {
  const node = exp.sym.valueDeclaration ?? exp.sym.getDeclarations()?.[0];
  const docs = {};
  for (const sig of exp.valueType.getCallSignatures()) {
    const param = sig.getParameters()[0];
    if (!param) continue;
    const pType = checker.getTypeOfSymbolAtLocation(param, node);
    for (const p of checker.getPropertiesOfType(checker.getApparentType(pType))) {
      const own = (p.getDeclarations() ?? []).filter((d) => isOwnFile(d.getSourceFile().fileName, treeDir));
      if (!own.length) continue;
      const set = (docs[p.getName()] ??= new Set());
      for (const d of own) {
        const t = jsDocText(ts, d);
        if (t) set.add(firstSentence(t));
      }
    }
  }
  return Object.fromEntries(Object.entries(docs).map(([k, s]) => [k, [...s].sort().join(' / ')]));
}

// JSDoc first sentence of an exported symbol (component, const, type, function).
export function symbolDoc(ts, checker, sym) {
  const t = ts.displayPartsToString(sym.getDocumentationComment(checker));
  return t.trim() ? firstSentence(t) : '';
}

// ── Defaults (source programs only) ─────────────────────────────────────────
// The function that renders a component: follows `X as T`, identifiers, and
// call wrappers (forwardRef(fn), memo(fn), Object.assign(fn, …)) to the first
// function-like argument; for a factory call (createShape(…)) it follows the
// factory's own return statements. Only declarations in the tree's own files
// are followed. Returns null when it cannot tell (e.g. a re-exported primitive).
export function findRenderFunction(ts, checker, node, treeDir, seen = new Set()) {
  if (!node || seen.has(node)) return null;
  seen.add(node);
  const rec = (n) => findRenderFunction(ts, checker, n, treeDir, seen);
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) return node;
  if (ts.isVariableDeclaration(node)) return rec(node.initializer);
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression?.(node) || ts.isNonNullExpression(node) || (ts.isSatisfiesExpression && ts.isSatisfiesExpression(node)))
    return rec(node.expression);
  if (ts.isIdentifier(node) || ts.isPropertyAccessExpression(node)) {
    let sym = checker.getSymbolAtLocation(node);
    if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
    const d = sym?.valueDeclaration ?? sym?.getDeclarations()?.[0];
    if (!d || !isOwnFile(d.getSourceFile().fileName, treeDir)) return null;
    return rec(d);
  }
  if (ts.isCallExpression(node)) {
    for (const a of node.arguments) {
      const r = rec(a);
      if (r) return r;
    }
    // A factory: follow what its body returns.
    const factory = rec(node.expression);
    if (factory && factory.body) {
      if (!ts.isBlock(factory.body)) return rec(factory.body);
      let found = null;
      const visit = (n) => {
        if (found) return;
        if (ts.isReturnStatement(n) && n.expression) found = rec(n.expression);
        else if (!ts.isFunctionLike(n)) ts.forEachChild(n, visit);
      };
      ts.forEachChild(factory.body, visit);
      return found;
    }
    return null;
  }
  return null;
}

// Destructuring defaults of the render function's props parameter: from the
// parameter's binding pattern, or from `const { … } = props` statements at the
// top of the body when the parameter is a plain identifier. Values are the
// SOURCE expressions (`ButtonSize.standard`), never evaluated.
export function extractDefaults(ts, fn) {
  const out = {};
  const p = fn?.parameters?.[0];
  if (!p) return out;
  const fromPattern = (pat) => {
    for (const el of pat.elements) {
      if (el.dotDotDotToken || !el.initializer) continue;
      const key = el.propertyName ? el.propertyName.getText() : el.name.getText();
      out[key] = squash(el.initializer.getText());
    }
  };
  if (ts.isObjectBindingPattern(p.name)) fromPattern(p.name);
  else if (ts.isIdentifier(p.name) && fn.body && ts.isBlock(fn.body)) {
    for (const st of fn.body.statements) {
      if (!ts.isVariableStatement(st)) continue;
      for (const d of st.declarationList.declarations)
        if (ts.isObjectBindingPattern(d.name) && d.initializer && ts.isIdentifier(d.initializer) && d.initializer.text === p.name.text)
          fromPattern(d.name);
    }
  }
  return sortObj(out);
}

// ── Const objects (keys and values) ─────────────────────────────────────────
export function extractConstEntries(ts, checker, exp, treeDir, maxDepth = 4) {
  const node = exp.sym.valueDeclaration;
  const entries = {};
  const walk = (type, path, depth) => {
    const isObj =
      type.flags & ts.TypeFlags.Object &&
      !type.getCallSignatures().length &&
      !checker.isArrayType?.(type) &&
      !checker.isTupleType?.(type);
    const props = isObj ? checker.getPropertiesOfType(type) : [];
    const ownProps = props.filter((p) =>
      (p.getDeclarations() ?? []).some((d) => isOwnFile(d.getSourceFile().fileName, treeDir)),
    );
    if (!isObj || depth >= maxDepth || !ownProps.length) {
      entries[path || '(value)'] = typeText(ts, checker, type, node);
      return;
    }
    for (const p of ownProps) {
      const t = checker.getTypeOfSymbolAtLocation(p, node);
      walk(t, path ? `${path}.${p.getName()}` : p.getName(), depth + 1);
    }
  };
  walk(exp.valueType, '', 0);
  return sortObj(entries);
}

// ── Types / functions ───────────────────────────────────────────────────────
// instType: for a generic type, the probe's instantiation at its defaults.
// Members = own-declared properties; for a union of object types (a
// discriminated props union) every constituent's members are listed, and a
// member missing from some constituents is marked "(some variants)".
export function extractType(ts, checker, exp, treeDir, instType) {
  const decl = exp.sym.getDeclarations()?.find((d) => ts.isTypeAliasDeclaration(d) || ts.isInterfaceDeclaration(d));
  if (!decl) return { text: null, members: {} };
  const declared = checker.getDeclaredTypeOfSymbol(exp.sym);
  const type = instType ?? declared;
  const declText = ts.isTypeAliasDeclaration(decl) ? squash(decl.type.getText()) : null;
  const generics = decl.typeParameters ? squash(decl.typeParameters.map((t) => t.getText()).join(', ')).replace(/'/g, '"') : null;
  const members = {};
  const isObjUnion = type.isUnion() && type.types.every((t) => t.flags & ts.TypeFlags.Object || t.isIntersection());
  const parts = isObjUnion ? type.types : type.isUnion() ? [] : [type];
  const seen = new Map();
  for (const part of parts) {
    let props = [];
    try {
      props = checker.getPropertiesOfType(part);
    } catch {}
    for (const p of props) {
      const ds = p.getDeclarations() ?? [];
      const own = ds.filter((d) => isOwnFile(d.getSourceFile().fileName, treeDir));
      if (!own.length) continue;
      // Same rule as extractProps: read each OWN declaration's type node. The
      // merged symbol's type is intersected with inherited DOM members (e.g.
      // HTMLAttributes' `color?: string`) and subtype-reduced, so `DsColor`
      // would print as `string`. Mapped members with no type node fall back.
      const typed = own.filter((d) => d.type);
      const name = p.getName().replace(/@\d+$/, '');
      if (!seen.has(name)) seen.set(name, new Set());
      let txt;
      if (typed.length) {
        for (const d of typed) {
          const opt = d.questionToken || p.flags & ts.SymbolFlags.Optional ? '?: ' : ': ';
          txt = opt + typeText(ts, checker, checker.getTypeFromTypeNode(d.type), d);
          seen.get(name).add(txt);
        }
      } else {
        const t = checker.getTypeOfSymbolAtLocation(p, decl);
        txt = (p.flags & ts.SymbolFlags.Optional ? '?: ' : ': ') + typeText(ts, checker, t, decl);
        seen.get(name).add(txt);
      }
      members[name] ??= { txt, count: 0 };
      members[name].count++;
    }
  }
  const flat = {};
  for (const [n, m] of Object.entries(members)) {
    const variants = [...seen.get(n)].sort();
    flat[n] = (variants.length > 1 ? variants.join(' / ') : m.txt) + (isObjUnion && m.count < parts.length ? ' (some variants)' : '');
  }
  return {
    declaredAs: ts.isInterfaceDeclaration(decl) ? 'interface' : 'type',
    generics,
    text: declText,
    expanded: expandedText(ts, checker, type, decl),
    members: sortObj(flat),
  };
}

export function extractFunction(ts, checker, exp) {
  const node = exp.sym.valueDeclaration;
  return exp.valueType
    .getCallSignatures()
    .map((s) => unqualify(squash(checker.signatureToString(s, node, TF(ts)))));
}

// ── CSS parsing ─────────────────────────────────────────────────────────────
export function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

// Formatting-only differences (`color-mix( in srgb, … )` wrapped over lines)
// are not value changes: collapse whitespace, and inside parens.
export const normCssValue = (v) => squash(v).replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');

// Walks a stylesheet and yields { path: [at-rule/selector...], decls: [[prop, value]] }
// for every block that contains declarations.
export function walkCss(css) {
  css = stripCssComments(css);
  const blocks = [];
  const stack = [];
  let buf = '';
  let inStr = null;
  let parenDepth = 0;
  const flushDecls = (text) => {
    const top = stack[stack.length - 1];
    if (!top) return;
    for (const raw of text.split(';')) {
      const s = raw.trim();
      const i = s.indexOf(':');
      if (i <= 0) continue;
      const prop = s.slice(0, i).trim();
      if (!/^--?[\w-]+$|^[a-z-]+$/.test(prop)) continue;
      top.decls.push([prop, normCssValue(s.slice(i + 1))]);
    }
  };
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (inStr) {
      buf += c;
      if (c === '\\') { buf += css[++i] ?? ''; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    // CSS escape outside a string (Tailwind class names: \( \' \: \/ …) — never
    // a quote, paren or brace for parsing purposes.
    if (c === '\\') { buf += c + (css[++i] ?? ''); continue; }
    if (c === '"' || c === "'") { inStr = c; buf += c; continue; }
    if (c === '(') parenDepth++;
    if (c === ')') parenDepth--;
    if (parenDepth > 0) { buf += c; continue; }
    if (c === '{') {
      // buf = pending declarations ... + selector. Selector is after the last ';'.
      const j = buf.lastIndexOf(';');
      const before = j >= 0 ? buf.slice(0, j + 1) : '';
      const sel = squash(j >= 0 ? buf.slice(j + 1) : buf);
      if (before) flushDecls(before);
      const block = { selector: sel, decls: [], path: [...stack.map((b) => b.selector), sel] };
      stack.push(block);
      blocks.push(block);
      buf = '';
    } else if (c === '}') {
      flushDecls(buf);
      buf = '';
      stack.pop();
    } else {
      buf += c;
    }
  }
  return blocks;
}

// Comment-preserving parse for docs: every comment and every custom-property
// declaration with its line numbers and enclosing block path. Offsets are into
// the original text. Comments are blanked (same length) before the structure
// scan, so a brace or semicolon inside a comment never counts.
export function parseCssDecls(css) {
  const lineStarts = [0];
  for (let i = 0; i < css.length; i++) if (css.charCodeAt(i) === 10) lineStarts.push(i + 1);
  const lineAt = (off) => {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= off) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  };
  const comments = [];
  for (const m of css.matchAll(/\/\*([\s\S]*?)\*\//g))
    comments.push({ text: m[1], start: m.index, end: m.index + m[0].length, startLine: lineAt(m.index), endLine: lineAt(m.index + m[0].length - 1) });
  const blanked = css.replace(/\/\*[\s\S]*?\*\//g, (s) => s.replace(/[^\n]/g, ' '));
  const blocks = [];
  const decls = [];
  const stack = [];
  let segStart = 0;
  let inStr = null;
  let paren = 0;
  const segment = (end) => {
    const raw = blanked.slice(segStart, end);
    const lead = raw.length - raw.trimStart().length;
    const m = raw.match(/^\s*(--[\w-]+)\s*:([\s\S]*)$/);
    if (m && stack.length) {
      const start = segStart + lead;
      decls.push({
        prop: m[1],
        value: normCssValue(m[2]),
        start,
        end,
        line: lineAt(start),
        endLine: lineAt(end),
        block: stack[stack.length - 1],
      });
    }
  };
  for (let i = 0; i < blanked.length; i++) {
    const c = blanked[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '\\') { i++; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '(') paren++;
    else if (c === ')') paren--;
    if (paren > 0) continue;
    if (c === '{') {
      const selector = squash(blanked.slice(segStart, i));
      const block = { selector, path: [...stack.map((b) => b.selector), selector], open: i, openLine: lineAt(i), close: null, closeLine: null };
      stack.push(block);
      blocks.push(block);
      segStart = i + 1;
    } else if (c === '}') {
      segment(i);
      const b = stack.pop();
      if (b) { b.close = i; b.closeLine = lineAt(i); }
      segStart = i + 1;
    } else if (c === ';') {
      segment(i);
      segStart = i + 1;
    }
  }
  // Blank lines outside comments (a blank line inside a comment separates nothing).
  const inComment = new Set();
  for (const c of comments) for (let l = c.startLine; l <= c.endLine; l++) inComment.add(l);
  const blankLines = new Set();
  css.split('\n').forEach((l, i) => { if (!l.trim() && !inComment.has(i + 1)) blankLines.add(i + 1); });
  return { comments, blocks, decls, blankLines, lineAt };
}

// --ui-* tokens of tokens.css grouped by block. The block key drops @layer
// wrappers (recorded separately as `layer`) so a block moving into a layer
// shows as a layer change, not as every token removed and re-added.
export function blockKey(path) {
  const parts = path.filter((p) => !/^@layer\b/.test(p));
  const k = parts.join(' > ');
  if (k === ':root, .light') return 'light';
  if (k === '.dark') return 'dark';
  return k;
}

export function blockLayer(path) {
  return path.filter((p) => /^@layer\b/.test(p)).map((p) => p.replace(/^@layer\s+/, '')).join(' > ') || null;
}

export function extractTokens(cssText, { prefix = '--ui-' } = {}) {
  const out = {};
  for (const b of walkCss(cssText)) {
    const decls = b.decls.filter(([p]) => p.startsWith(prefix));
    if (!decls.length) continue;
    const key = blockKey(b.path);
    const layer = blockLayer(b.path);
    out[key] ??= { layer, tokens: {} };
    for (const [p, v] of decls) out[key].tokens[p] = v;
  }
  for (const k of Object.keys(out)) out[k].tokens = sortObj(out[k].tokens);
  return sortObj(out);
}

// Every class selector in a stylesheet. Selectors only (never values), with
// CSS escapes decoded (hover\:bg-x → hover:bg-x).
export function extractClasses(cssText) {
  const set = new Set();
  for (const b of walkCss(cssText)) {
    const sel = b.selector;
    if (sel.startsWith('@')) continue;
    // drop attribute selectors' contents and :is()/:where() args are kept (they hold classes)
    const s = sel.replace(/\[[^\]]*\]/g, (m) => (m.includes('\\') ? m : '[]'));
    // Ident chars: ASCII word chars, any non-ASCII char (Tailwind keeps e.g.
    // "…" from a junk candidate), hex escapes (`\2c `) and one-char escapes.
    const re = /\.((?:[A-Za-z_-]|[^\x00-\x7F]|\\[0-9a-fA-F]{1,6} ?|\\[^0-9a-fA-F])(?:[\w-]|[^\x00-\x7F]|\\[0-9a-fA-F]{1,6} ?|\\[^0-9a-fA-F])*)/g;
    let m;
    while ((m = re.exec(s))) {
      const name = m[1]
        .replace(/\\([0-9a-fA-F]{1,6}) ?/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/\\(.)/g, '$1');
      if (/^\d/.test(name)) continue;
      set.add(name);
    }
  }
  const all = [...set].sort();
  return {
    ds: all.filter((c) => c.startsWith('ds-')),
    textStyle: all.filter((c) => c.startsWith('text-style-')),
    utilities: all.filter((c) => !c.startsWith('ds-') && !c.startsWith('text-style-')),
  };
}

export function extractPackage(pkg) {
  return {
    exports: pkg.exports ?? null,
    files: pkg.files ?? null,
    peerDependencies: pkg.peerDependencies ?? null,
    bin: pkg.bin ?? null,
    // extras, consumer-visible
    peerDependenciesMeta: pkg.peerDependenciesMeta ?? null,
    dependencies: pkg.dependencies ?? null,
    sideEffects: pkg.sideEffects ?? null,
    main: pkg.main ?? null,
    module: pkg.module ?? null,
    types: pkg.types ?? null,
    engines: pkg.engines ?? null,
  };
}

