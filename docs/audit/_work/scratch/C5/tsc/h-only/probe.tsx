import { createRef, type PropsWithoutRef, type ElementType } from "react";
import { Button, ButtonVariant, type ButtonProps } from "./src/components/Button";
import { CopyButton, CopyButtonVariant } from "./src/components/CopyButton";

// ---- must compile in BOTH versions (consumer calls that work today) ----
export const ok1 = <CopyButton value="npm install" />;
export const ok2 = <CopyButton variant={CopyButtonVariant.secondary} value="npm install" onCopied={(v) => v.length} />;
export const ok3 = <CopyButton value="x" className="ml-auto" disabled aria-label="Copy command" onClick={(e) => e.currentTarget.blur()} data-testid="c" />;
const r = createRef<HTMLElement>();
export const ok4 = <CopyButton ref={r} value="x" />;
export const ok5 = <Button asChild variant={ButtonVariant.primary}><a href="/x">Go</a></Button>;
export const ok6 = <Button<"a"> href="/x">Go</Button>;
export const ok7 = <Button onClick={(e) => e.currentTarget.disabled}>Go</Button>;

// ---- must FAIL after the fix (each @ts-expect-error is "unused" in orig) ----
// @ts-expect-error value is required
export const bad1 = <CopyButton />;
// @ts-expect-error value must be a string
export const bad2 = <CopyButton value={123} />;
// @ts-expect-error variant is closed
export const bad3 = <CopyButton value="x" variant="bogus" />;
// @ts-expect-error onCopied must be a function
export const bad4 = <CopyButton value="x" onCopied={42} />;
// @ts-expect-error unknown prop
export const bad5 = <CopyButton value="x" foo={1} />;
// @ts-expect-error href is not a button attribute
export const bad6 = <CopyButton value="x" href="/nope" />;
// @ts-expect-error size is omitted by design
export const bad7 = <CopyButton value="x" size="icon" />;

// ---- F-036: render-function props (what forwardRef hands the body) ----
type FixedRender = PropsWithoutRef<ButtonProps<"button">>;
type OrigRender = PropsWithoutRef<ButtonProps<ElementType>>;
// @ts-expect-error typo is caught on the concrete-element props
export const t1 = ({ varaint }: FixedRender) => varaint;
export const t2 = ({ varaint }: OrigRender) => varaint; // compiles: the orig body types are any

// ---- F-036: the other polymorphic bases keep their public generic signatures ----
import { OutlineButton } from "./src/components/OutlineButton/OutlineButton";
import { ShapeButton } from "./src/components/ShapeButton/ShapeButton";
import { ShapeButtons } from "./src/components/ShapeButton/constants";
import { DropdownTrigger, TextDropdownTrigger } from "./src/components/DropdownTrigger/DropdownTrigger";
import { BaseText, BodyText } from "./src/components/Text/BaseText";
export const p1 = <OutlineButton<"a"> href="/x" glowing>Go</OutlineButton>;
export const p2 = <ShapeButton shape={ShapeButtons.squircle} onClick={(e) => e.currentTarget.disabled}>Go</ShapeButton>;
export const p3 = <DropdownTrigger<"a"> href="/x">Go</DropdownTrigger>;
export const p4 = <TextDropdownTrigger>Go</TextDropdownTrigger>;
export const p5 = <BaseText as="label" htmlFor="id">x</BaseText>;
export const p6 = <BodyText as="p" fontSize={16}>x</BodyText>;
// @ts-expect-error OutlineButton's own props are still checked at the call site
export const p7 = <OutlineButton glowing="yes">Go</OutlineButton>;

// ---- F-093: CTAButton children ----
import { CTAButton, type CTAButtonProps } from "./src/components/CTAButton/CTAButton";
const icon = <span />;
export const c1 = <CTAButton text="Buy" icon={icon} href="/buy" />;
export const c2 = <CTAButton asChild text="Buy" icon={icon}><a href="/buy" /></CTAButton>;
export const c3 = <CTAButton asChild text="Go" icon={icon}><button type="button" onClick={() => {}} /></CTAButton>;
const ar = { current: null as HTMLAnchorElement | null };
export const c4 = <CTAButton ref={ar} text="Buy" icon={icon} href="/buy" />;
export interface MyCTAProps extends CTAButtonProps { tracking?: string }   // consumer wrapper interface keeps compiling
export const c5 = (p: MyCTAProps) => <CTAButton text={p.text} icon={p.icon} href={p.href} />;
// @ts-expect-error children without asChild are discarded at runtime
export const c6 = <CTAButton text="Buy" icon={icon}>Limited offer</CTAButton>;
declare const isLink: boolean;
export const c7 = <CTAButton asChild={isLink} text="Buy" icon={icon}><a href="/buy" /></CTAButton>;
// @ts-expect-error a string label is never slotted
export const c8 = <CTAButton asChild={isLink} text="Buy" icon={icon}>Limited offer</CTAButton>;

// ---- F-037: null no longer accepted ----
import { ButtonSize } from "./src/components/Button";
export const n1 = <Button variant={ButtonVariant.danger} size={ButtonSize.iconSm}>x</Button>;
export const n2 = <Button variant="ghost">x</Button>;
declare const on: boolean;
export const n3 = <Button variant={on ? ButtonVariant.primary : undefined}>x</Button>;
// @ts-expect-error null is not a variant
export const n4 = <Button variant={null}>x</Button>;
// @ts-expect-error null is not a size
export const n5 = <Button size={null}>x</Button>;

// ---- F-062: consumer mouse handlers type-check ----
export const m1 = <OutlineButton onMouseMove={(e) => e.clientX} onMouseLeave={() => {}}>Go</OutlineButton>;
