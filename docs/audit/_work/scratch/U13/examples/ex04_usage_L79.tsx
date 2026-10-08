// usage/SKILL.md:79-86 — SCAFFOLD: wrapper, fragment; the three <div ...> are
// unclosed in the doc (illustrative fragments) and are self-closed here.
export const Ex = () => ( // SCAFFOLD
<>
{/* ✗ pixels, hex, inline styles, arbitrary values */}
<div style={{ padding: 16, borderRadius: 18, background: "#fff" }} /* SCAFFOLD self-close */ />
<div className="p-[16px] rounded-[18px] bg-[#ffffff] shadow-[0_1px_4px_rgba(0,0,0,.15)]" />

{/* ✓ token-backed utilities — these re-theme and support dark mode for free */}
<div className="p-md rounded-normal bg-surface-primary shadow-menu" />
</>
);
