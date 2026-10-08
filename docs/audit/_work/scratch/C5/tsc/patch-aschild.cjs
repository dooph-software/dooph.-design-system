// WI-C5-02 patch applied to the probe copies (type-check only)
const fs = require("fs");
const rep = (f, a, b) => { const c = fs.readFileSync(f, "utf8"); if (!c.includes(a)) throw new Error(f + ": " + a); fs.writeFileSync(f, c.replace(a, b)); };
rep("OutlineButton/OutlineButton.tsx", 'import { Slot } from "@radix-ui/react-slot";', 'import { Slot, Slottable } from "@radix-ui/react-slot";');
rep("OutlineButton/OutlineButton.tsx", `          <span className="relative z-10 inline-flex items-center gap-2">
            {children}
          </span>`, `          <Slottable child={children}>
            {(child) => (
              <span className="relative z-10 inline-flex items-center gap-2">
                {child}
              </span>
            )}
          </Slottable>`);
rep("ShapeButton/ShapeButton.tsx", 'import { Slot } from "@radix-ui/react-slot";', 'import { Slot, Slottable } from "@radix-ui/react-slot";');
rep("ShapeButton/ShapeButton.tsx", `        <span className="relative z-10 inline-flex items-center justify-center">
          {children}
        </span>`, `        <Slottable child={children}>
          {(child) => (
            <span className="relative z-10 inline-flex items-center justify-center">
              {child}
            </span>
          )}
        </Slottable>`);
rep("DropdownTrigger/DropdownTrigger.tsx", 'import { Slot } from "@radix-ui/react-slot";', 'import { Slot, Slottable } from "@radix-ui/react-slot";');
rep("DropdownTrigger/DropdownTrigger.tsx", `      <span className="flex-1 text-left">{children}</span>`, `      <Slottable child={children}>
        {(child) => <span className="flex-1 text-left">{child}</span>}
      </Slottable>`);
rep("DropdownTrigger/DropdownTrigger.tsx", `        <span>{children}</span>`, `        <Slottable child={children}>{(child) => <span>{child}</span>}</Slottable>`);
