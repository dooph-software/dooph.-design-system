// Type probes against the built dist of @dooph-software/design-system (audit-build copy).
import { useRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import {
  Button,
  ButtonVariant,
  ButtonSize,
  type ButtonProps,
  CopyButton,
  type CopyButtonProps,
  CopyButtonVariant,
  OutlineButton,
  ShapeButton,
  ShapeButtons,
  ShapeButtonVariant,
  CTAButton,
  CTAButtonSize,
  CTAButtonVariant,
  SplitButton,
  SplitButtonAction,
  SplitButtonTrigger,
} from "@dooph-software/design-system";

// P1: consumer usage skill SaveButton example, verbatim (skills/dooph-design-system-usage/SKILL.md:352-360)
export function SaveButton({ busy, disabled, children = "Save", ...props }: ButtonProps & { busy?: boolean }) {
  return (
    <Button variant={ButtonVariant.primary} aria-busy={busy || undefined} disabled={busy || disabled} {...props}>
      {children}
    </Button>
  );
}

// P2: what does CopyButtonProps["onClick"] look like?
type CopyOnClick = NonNullable<CopyButtonProps["onClick"]>;
type CopyOnClickParam = Parameters<CopyOnClick>[0];
const probeParamIsNever: [CopyOnClickParam] extends [never] ? "never" : "not-never" = "never";

// P3: consumer passes an ordinary onClick handler typed for a button
export function P3() {
  return (
    <CopyButton
      value="x"
      variant={CopyButtonVariant.secondary}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => console.log(e.currentTarget.disabled)}
    />
  );
}

// P4: consumer passes a bogus attribute that no <button> has — accepted?
export function P4() {
  return <CopyButton value="x" href="/nope" />;
}

// P5: CopyButton ref typing
export function P5() {
  const r = useRef<HTMLButtonElement>(null);
  return <CopyButton value="x" ref={r} />;
}

// P6: ShapeButton / OutlineButton asChild type-check (runtime throws, see aschild.cjs)
export function P6() {
  return (
    <>
      <ShapeButton asChild shape={ShapeButtons.squircle} variant={ShapeButtonVariant.primary}>
        <a href="/x">i</a>
      </ShapeButton>
      <OutlineButton asChild glowing glowColor1="#c084fc">
        <a href="/x">Go</a>
      </OutlineButton>
    </>
  );
}

// P7: CTAButton, SplitButton smoke
export function P7() {
  return (
    <>
      <CTAButton text="Go" icon={<span />} size={CTAButtonSize.big} variant={CTAButtonVariant.secondary} href="/x" />
      <SplitButton actionProps={{ onClick: () => {} }} triggerProps={{ "aria-label": "More" }}>Save</SplitButton>
      <SplitButtonAction>Save</SplitButtonAction>
      <SplitButtonTrigger />
      <Button size={ButtonSize.iconMicro} variant={ButtonVariant.ghost} />
    </>
  );
}

// P8: what is ComponentPropsWithoutRef<typeof Button>["type"]?
type BtnProps = ComponentPropsWithoutRef<typeof Button>;
type BtnType = BtnProps extends { type?: infer T } ? T : "no-type-key";
const probeType: BtnType = "submit";
export { probeParamIsNever, probeType };
