import { BodyText, HeroText, Fonts, FontSizes, FontWeights } from "@dooph-software/design-system";
export const Ex = () => (<>
<BodyText font={Fonts.title} fontSize={FontSizes.heading} fontWeight={FontWeights.bold} />
<HeroText as="h1" lineHeight={1.05}>Dashboard</HeroText>
</>);
