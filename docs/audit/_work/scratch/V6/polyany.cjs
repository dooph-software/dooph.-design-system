// Read-only: build a TS program over the 7 polymorphic files and print the type of each
// destructured binding in the first forwardRef render-callback parameter at the cited line.
const path=require('path');
const ts=require('C:/Users/stick/Github/dooph/dooph-ds-audit-build/node_modules/typescript');
const root='C:/Users/stick/Github/dooph/dooph-Design-System';
const targets=[['src/components/Button/Button.tsx',125],['src/components/CopyButton/CopyButton.tsx',30],['src/components/DropdownTrigger/DropdownTrigger.tsx',52],['src/components/DropdownTrigger/DropdownTrigger.tsx',304],['src/components/OutlineButton/OutlineButton.tsx',73],['src/components/ShapeButton/ShapeButton.tsx',105],['src/components/Text/BaseText.tsx',62]];
const cfg=ts.getParsedCommandLineOfConfigFile(path.join(root,'tsconfig.json'),{},{...ts.sys,onUnRecoverableConfigFileDiagnostic:()=>{}});
const prog=ts.createProgram(targets.map(t=>path.join(root,t[0])),{...cfg.options,noEmit:true});
const chk=prog.getTypeChecker();
let total=0,anyc=0;
for(const [f,line] of targets){
  const sf=prog.getSourceFile(path.join(root,f));
  const out=[];
  const visit=n=>{
    if(ts.isObjectBindingPattern(n)&&ts.isParameter(n.parent)){
      const l=sf.getLineAndCharacterOfPosition(n.getStart()).line+1;
      if(Math.abs(l-line)<=2){
        for(const el of n.elements){ if(el.dotDotDotToken) continue; const t=chk.typeToString(chk.getTypeAtLocation(el.name)); out.push(el.name.getText()+':'+t); total++; if(t==='any')anyc++; }
      }
    }
    ts.forEachChild(n,visit);
  };
  visit(sf);
  console.log(f+':'+line+'  '+out.join(', '));
}
console.log('total named bindings',total,'any',anyc);
