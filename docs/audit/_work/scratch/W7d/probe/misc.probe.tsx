import { forwardRef, type AnchorHTMLAttributes } from "react";
import { Button } from "../../../../../../src/components/Button/Button";
import { ButtonVariant } from "../../../../../../src/components/Button/constants";
import { TextLink } from "../../../../../../src/components/TextLink/TextLink";
import { BodyText, LabelText, MonoText } from "../../../../../../src/components/Text";
import { IconSize, SearchIcon } from "../../../../../../src/components/Icons";
import { OutlineButton } from "../../../../../../src/components/OutlineButton/OutlineButton";
/** Stands in for Next.js `Link`: a component that renders its own `<a>` and forwards the ref. */
const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  (props, ref) => <a ref={ref} {...props} />,
);
RouterLink.displayName = "RouterLink";
export const a = () => (
  <TextLink asChild>
    <RouterLink href="#changelog">Changelog</RouterLink>
  </TextLink>
);
export const b = () => (
  <div>
    {(Object.values(ButtonVariant).filter((v) => v !== ButtonVariant.text) as ButtonVariant[]).map((v) => (
      <Button key={v} variant={v} disabled>{v}</Button>
    ))}
    <MonoText as="code">x</MonoText>
    <BodyText as="p">y</BodyText>
    <LabelText className="text-text">⌘</LabelText>
    <OutlineButton><SearchIcon size={IconSize.md} />Find anything</OutlineButton>
  </div>
);
