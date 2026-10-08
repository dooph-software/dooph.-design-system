// Reproduces ToastClose className merge using the built package's own cn + buttonVariants.
import { cn, buttonVariants } from "file:///C:/Users/stick/Github/dooph/dooph-ds-audit-build/dist/index.js";
const out = cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0 text-current hover:text-current active:text-current");
console.log(out.split(" ").filter(c => /text-|hover|active/.test(c)).join("\n"));
