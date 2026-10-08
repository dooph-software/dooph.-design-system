// usage/SKILL.md:254-260 with HeroText ADDED to the import (SCAFFOLD) — isolates
// whether anything besides the missing import fails.
import { BodyText, HeroText, Fonts, FontSizes, FontWeights, Tracking, FontAxes } from "@dooph-software/design-system";

export const Ex = () => ( // SCAFFOLD
<>
<BodyText font={Fonts.title} fontSize={FontSizes.heading} fontWeight={FontWeights.bold} />
<BodyText fontSize={16} fontWeight={450} lineHeight={1.6} letterSpacing={2} />
<HeroText as="h1" lineHeight={1.05}>Dashboard</HeroText>
</>
);
