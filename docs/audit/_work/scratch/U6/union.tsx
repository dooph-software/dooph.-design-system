import { Input, InputVariant, SliderStepped, SliderVariant } from "@dooph-software/design-system";
import type { ReactNode } from "react";
const maybe: ReactNode = undefined;
export const a = <Input variant={InputVariant.iconText} icon={null} />;
export const b = <Input variant={InputVariant.iconText} icon={undefined} />;
export const c = <Input variant={InputVariant.iconText} icon={maybe} />;
export const d = <Input variant={InputVariant.iconText} icon={false} />;
export const e = <SliderStepped variant={SliderVariant.custom} color="" />;
export const f = <Input variant={InputVariant.iconText} />;
