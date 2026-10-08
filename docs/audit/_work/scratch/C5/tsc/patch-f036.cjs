// F-036 patch applied to the probe copies (mirrors WI-C5-04 steps exactly)
const fs = require("fs");
const rep = (f, a, b) => { const c = fs.readFileSync(f, "utf8"); if (!c.includes(a)) throw new Error(f + ": anchor not found: " + a); fs.writeFileSync(f, c.replace(a, b)); };
rep("OutlineButton/OutlineButton.tsx", "  OutlineButtonProps<ElementType>\n>(", '  OutlineButtonProps<"button">\n>(');
rep("ShapeButton/ShapeButton.tsx", "forwardRef<HTMLElement, ShapeButtonProps<ElementType>>(", 'forwardRef<HTMLElement, ShapeButtonProps<"button">>(');
rep("ShapeButton/ShapeButton.tsx", "    const Shape = shapeComponents[shape as ShapeButtons];\n    const resolvedVariant = variant as ShapeButtonVariant;\n", "    const Shape = shapeComponents[shape];\n");
rep("ShapeButton/ShapeButton.tsx", "          contentClasses[resolvedVariant],", "          contentClasses[variant],");
rep("ShapeButton/ShapeButton.tsx", "            shapeFillClasses[resolvedVariant],", "            shapeFillClasses[variant],");
rep("DropdownTrigger/DropdownTrigger.tsx", "  DropdownTriggerProps<ElementType>\n>(", '  DropdownTriggerProps<"button">\n>(');
rep("DropdownTrigger/DropdownTrigger.tsx", "  TextDropdownTriggerProps<ElementType>\n>(", '  TextDropdownTriggerProps<"button">\n>(');
rep("Text/BaseText.tsx", "const BaseTextBase = forwardRef<HTMLElement, BaseTextProps<ElementType>>(",
  '/* The render function sees the own props plus span attributes; only the exported\n * cast below is polymorphic. `as` stays ElementType so any tag can render. */\ntype BaseTextRenderProps = BaseTextOwnProps & { as?: ElementType } & Omit<\n  ComponentPropsWithoutRef<"span">,\n  keyof BaseTextOwnProps | "as"\n>;\n\nconst BaseTextBase = forwardRef<HTMLElement, BaseTextRenderProps>(');
rep("Text/BaseText.tsx", "    const role = unstyled ? undefined : (variant as TextVariant);", "    const role = unstyled ? undefined : variant;");
