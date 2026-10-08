// WI-C5-09 patch on the probe copies (type-check only)
const fs = require("fs");
const f = "OutlineButton/OutlineButton.tsx";
let c = fs.readFileSync(f, "utf8");
const rep = (a, b) => { if (!c.includes(a)) throw new Error(a); c = c.replace(a, b); };
rep(`      glowColor2,
      children,
      ...props`, `      glowColor2,
      children,
      onMouseMove,
      onMouseLeave,
      ...props`);
rep(`      (event: React.MouseEvent<HTMLElement>) => {
        if (glowing) return; // controlled mode — no cursor tracking needed`, `      (event: React.MouseEvent<HTMLButtonElement>) => {
        onMouseMove?.(event);
        if (glowing) return; // controlled mode — no cursor tracking needed`);
rep(`      [glowing],
    );

    const handleMouseLeave = useCallback(() => {
      if (glowing) return;`, `      [glowing, onMouseMove],
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(event);
      if (glowing) return;`);
rep(`      el.style.setProperty("--gy", "0.5");
    }, [glowing]);`, `      el.style.setProperty("--gy", "0.5");
    },
      [glowing, onMouseLeave],
    );`);
fs.writeFileSync(f, c);
