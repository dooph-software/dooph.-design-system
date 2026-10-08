// Enumerate the public export names of <root>/src/index.ts using the TS checker.
// Usage: node list-exports.cjs <root> > out.txt
const ts = require("C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/typescript");
const path = require("path");
const root = path.resolve(process.argv[2]);
const entry = path.join(root, "src/index.ts");
const program = ts.createProgram([entry], {
  jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020,
  moduleResolution: ts.ModuleResolutionKind.Bundler, noEmit: true, skipLibCheck: true,
  allowJs: false, noResolve: false,
  typeRoots: ["C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/@types"],
  baseUrl: "C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules",
  paths: { "*": ["C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/*"] },
});
const checker = program.getTypeChecker();
const sf = program.getSourceFile(entry);
const sym = checker.getSymbolAtLocation(sf);
const exps = checker.getExportsOfModule(sym);
const rows = exps.map((e) => {
  let t = e;
  if (t.flags & ts.SymbolFlags.Alias) t = checker.getAliasedSymbol(t);
  const f = t.flags;
  const kinds = [];
  if (f & ts.SymbolFlags.Value) kinds.push("value");
  if (f & (ts.SymbolFlags.Type)) kinds.push("type");
  // for const objects record keys
  let keys = "";
  if (f & ts.SymbolFlags.Variable) {
    const decl = t.valueDeclaration;
    if (decl && ts.isVariableDeclaration(decl) && decl.initializer) {
      let init = decl.initializer;
      while (init && (ts.isAsExpression(init) || ts.isSatisfiesExpression?.(init) || ts.isParenthesizedExpression(init))) init = init.expression;
      if (init && ts.isObjectLiteralExpression(init)) {
        keys = init.properties.map((p) => p.name ? p.name.getText() : "?").join(",");
      }
    }
  }
  return `${e.name}\t${kinds.join("+")}\t${keys}`;
});
rows.sort();
console.log(rows.join("\n"));
