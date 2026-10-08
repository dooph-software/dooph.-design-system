// Task 4b: DS-declared props that the component body never reads.
const fs = require('fs');
const { ts, ROOT, srcFiles, load, rel, lineOf } = require('./prog.cjs');
const { program, checker } = load();
const out = [];
const inSrc = (d) => d && d.getSourceFile().fileName.replace(/\\/g, '/').startsWith(ROOT + '/src');

function refsIn(body, sym) {
  let c = 0;
  (function v(n) {
    if (ts.isIdentifier(n) && (checker.getSymbolAtLocation(n) === sym || (ts.isShorthandPropertyAssignment(n.parent) && checker.getShorthandAssignmentValueSymbol(n.parent) === sym))) c++;
    ts.forEachChild(n, v);
  })(body);
  return c;
}

for (const f of srcFiles) {
  const sf = program.getSourceFile(f);
  (function v(n) {
    const isFn = ts.isArrowFunction(n) || ts.isFunctionExpression(n) || ts.isFunctionDeclaration(n);
    const isForwardRefArg = n.parent && ts.isCallExpression(n.parent) && /forwardRef$/.test(n.parent.expression.getText(sf));
    const nm = ts.isFunctionDeclaration(n) && n.name ? n.name.text : (n.parent && ts.isVariableDeclaration(n.parent) ? n.parent.name.getText(sf) : '');
    let hasJsx = false; if (isFn && n.body) (function j(m){ if (ts.isJsxElement(m)||ts.isJsxSelfClosingElement(m)||ts.isJsxFragment(m)) hasJsx=true; else ts.forEachChild(m,j); })(n.body);
    const isComp = isFn && hasJsx && (isForwardRefArg || /^[A-Z]/.test(nm));
    if (isComp && n.parameters.length && n.body) {
      const p0 = n.parameters[0];
      const pType = checker.getTypeAtLocation(p0);
      const props = checker.getPropertiesOfType(pType).filter((s) => (s.declarations || []).some(inSrc));
      if (props.length) {
        const read = new Map(); // name -> refs
        let rest = null;
        const collectPattern = (pat) => {
          for (const el of pat.elements) {
            if (el.dotDotDotToken) { rest = el.name.getText(sf); continue; }
            const key = el.propertyName ? el.propertyName.getText(sf) : el.name.getText(sf);
            if (ts.isIdentifier(el.name)) read.set(key, refsIn(n.body, checker.getSymbolAtLocation(el.name)));
            else read.set(key, 1);
          }
        };
        if (ts.isObjectBindingPattern(p0.name)) collectPattern(p0.name);
        else if (ts.isIdentifier(p0.name)) {
          const psym = checker.getSymbolAtLocation(p0.name);
          (function w(m) {
            if (ts.isPropertyAccessExpression(m) && ts.isIdentifier(m.expression) && checker.getSymbolAtLocation(m.expression) === psym) read.set(m.name.text, (read.get(m.name.text) || 0) + 1);
            if (ts.isVariableDeclaration(m) && m.initializer && ts.isIdentifier(m.initializer) && checker.getSymbolAtLocation(m.initializer) === psym && ts.isObjectBindingPattern(m.name)) collectPattern(m.name);
            if (ts.isSpreadAssignment(m) || ts.isJsxSpreadAttribute(m)) { if (ts.isIdentifier(m.expression) && checker.getSymbolAtLocation(m.expression) === psym) rest = rest || p0.name.getText(sf) + '(whole)'; }
            ts.forEachChild(m, w);
          })(n.body);
        }
        for (const s of props) {
          const name = s.name;
          if (name === 'children' || name === 'className' || name === 'ref' || name === 'key') continue;
          const decl = s.declarations.find(inSrc);
          const where = `${rel(decl.getSourceFile().fileName)}:${lineOf(decl)}`;
          if (read.has(name)) { if (read.get(name) === 0) out.push(`DESTRUCTURED-NEVER-READ | ${rel(f)}:${lineOf(n)} | ${name} | declared ${where}`); }
          else { let dest='DROPPED(no rest)'; if (rest) { dest='TO-REST'; const rn=rest.replace('(whole)',''); (function d(m){ if (ts.isJsxSpreadAttribute(m) && m.expression.getText(sf)===rn) { const tag=m.parent.parent.tagName.getText(sf); dest = /^[a-z]/.test(tag) ? 'TO-DOM<'+tag+'>' : 'TO-COMPONENT<'+tag+'>'; } ts.forEachChild(m,d); })(n.body); } out.push(`${dest} | ${rel(f)}:${lineOf(n)} | ${name} | declared ${where}`); }
        }
      }
    }
    ts.forEachChild(n, v);
  })(sf);
}
fs.writeFileSync(ROOT + '/docs/audit/_work/scratch/HA/deadprops2.out.txt', out.join('\n'));
console.log(out.join('\n'));
