// usage/SKILL.md:52-60 — SCAFFOLD: imports + component wrapper + fragment
import { BodyText, HeroText } from "@dooph-software/design-system"; // SCAFFOLD
export const Ex = () => ( // SCAFFOLD
<>
{/* ✗ raw element + manual font/size */}
<p className="font-sans text-sm text-gray-700">Saved automatically</p>
<h1 className="text-3xl font-bold">Dashboard</h1>

{/* ✓ Text components carry the right family, size, weight, tracking, and axes */}
<BodyText className="text-text-secondary">Saved automatically</BodyText>
<HeroText>Dashboard</HeroText>
</>
);
