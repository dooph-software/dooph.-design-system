import {
  Calendar,
  DatePickerMode,
  Input,
  InputVariant,
  ProgressIndicator,
  RollingDigitsText,
  SliderStepped,
  SliderVariant,
} from "@dooph-software/design-system";
import type { ReactNode } from "react";

const maybe: ReactNode = undefined;
const maybeDate = undefined as Date | undefined;
const computedMode = "single" as string;

// Input: union admits nullish/boolean icons
export const i1 = <Input variant={InputVariant.iconText} icon={null} />;
export const i2 = <Input variant={InputVariant.iconText} icon={undefined} />;
export const i3 = <Input variant={InputVariant.iconText} icon={maybe} />;
export const i4 = <Input variant={InputVariant.iconText} icon={false} />;
export const i5 = <Input variant={InputVariant.iconText} />; // expect error

// Slider: custom requires color; "" admitted
export const s1 = <SliderStepped variant={SliderVariant.custom} color="" />;
export const s2 = <SliderStepped variant={SliderVariant.custom} />; // expect error

// Calendar: selected required
export const c1 = (
  <Calendar mode={DatePickerMode.singleDay} selected={maybeDate} onSelect={() => {}} />
); // expect error (exactOptional / Date | undefined)
export const c2 = (
  // @ts-expect-error - computed mode string
  <Calendar mode={computedMode} selected={new Date()} onSelect={() => {}} />
);

// RollingDigitsText: smallDecimals requires smallDecimalsComponent
export const r1 = <RollingDigitsText smallDecimals>{"$1.25"}</RollingDigitsText>; // expect error

// ProgressIndicator: NaN is a number
export const p1 = <ProgressIndicator progress={NaN} />;
export const p2 = <ProgressIndicator progress={0 / 0} />;
