import type { Meta, StoryObj } from "@storybook/react";
import { TextLink } from "./TextLink";
import { BodyText } from "../Text";

const meta = {
  title: "Components/TextLink",
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

export const Interactive: Story = {
  name: "Interactive (Hover/Active)",
  parameters: {
    docs: {
      description: {
        story: "Ghost foreground at rest, primary text on hover/active. No underline.",
      },
    },
  },
  args: {
    href: "#",
    children: "Hover or click to see state change",
  },
};

export const WithAsChild: Story = {
  name: "asChild with button",
  render: () => (
    <TextLink asChild>
      <button onClick={() => alert("Button clicked!")}>
        Click as button
      </button>
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
