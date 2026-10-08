// usage/SKILL.md:278-281 — SCAFFOLD: import, `elapsed`/`balance`, wrapper
import { BodyText, TitleText } from "@dooph-software/design-system"; // SCAFFOLD
declare const elapsed: string; declare const balance: string; // SCAFFOLD
export const Ex = () => ( // SCAFFOLD
<>
<BodyText tabular>{elapsed}</BodyText>
<TitleText tabular>{balance}</TitleText>
</>
);
