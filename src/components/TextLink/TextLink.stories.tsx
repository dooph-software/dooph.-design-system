import type { Meta, StoryObj } from "@storybook/react-vite";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { TextLink } from "./TextLink";
import { BodyText } from "../Text";

const meta = {
  title: "Text/TextLink",
  component: TextLink,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    href: { control: "text" },
    asChild: { control: "boolean" },
  },
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: "#",
    children: "Read the changelog",
  },
};

/** Stands in for Next.js `Link`: a component that renders its own `<a>` and forwards the ref. */
const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>((props, ref) => <a ref={ref} {...props} />);
RouterLink.displayName = "RouterLink";

export const WithAsChild: Story = {
  name: "asChild with a router link",
  render: () => (
    <TextLink asChild>
      <RouterLink href="#changelog">Changelog</RouterLink>
    </TextLink>
  ),
};

export const InlineSentence: Story = {
  name: "Inline in sentence",
  render: () => (
    <BodyText>
      Learn more about our{" "}
      <TextLink href="#">design principles</TextLink> in the documentation.
    </BodyText>
  ),
};
