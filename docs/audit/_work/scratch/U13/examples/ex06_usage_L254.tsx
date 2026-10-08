// usage/SKILL.md:254-260 — import line VERBATIM (it omits HeroText, which the
// block uses on its third line). SCAFFOLD: wrapper + fragment only.
import { BodyText, Fonts, FontSizes, FontWeights, Tracking, FontAxes } from "@dooph-software/design-system";

export const Ex = () => ( // SCAFFOLD
<>
<BodyText font={Fonts.title} fontSize={FontSizes.heading} fontWeight={FontWeights.bold} />
<BodyText fontSize={16} fontWeight={450} lineHeight={1.6} letterSpacing={2} />
<HeroText as="h1" lineHeight={1.05}>Dashboard</HeroText>
</>
);
