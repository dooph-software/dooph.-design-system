// usage/SKILL.md:96-101 — SCAFFOLD: import + wrapper
import { TitleText } from "@dooph-software/design-system"; // SCAFFOLD
export const Ex = () => ( // SCAFFOLD
// ✓ express it in JSX with utilities + Text components; no app-authored CSS rules
<div className="flex flex-col gap-xs p-md rounded-normal bg-surface-primary">
  <TitleText>Card title</TitleText>
</div>
);
