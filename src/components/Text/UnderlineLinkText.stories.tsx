import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { UnderlineLinkText } from "./UnderlineLinkText";
import { BodyText, HeroText } from "./BaseText";
import { TextLink } from "../TextLink";
import { Button, ButtonVariant } from "../Button";

const meta = {
  title: "Primitives/UnderlineLinkText",
  component: UnderlineLinkText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A sliding underline link decoration. The underline is present at rest; on hover it " +
          "wipes out to the right and immediately redraws in from the left. The line is a " +
          "`currentColor` gradient painted into `background` (not `text-decoration` or a " +
          "pseudo-element), so it inherits the child's color, survives across line wraps, and never " +
          "clips descenders. Triggers on its own `:hover`, an ancestor `.group:hover`, or the " +
          "`active` prop. Tune via `--ui-underline-link-thickness` / `--ui-underline-link-offset` / " +
          "`--ui-underline-link-duration` / `--ui-underline-link-ease`.",
      },
    },
  },
  tags: ["autodocs"],
  args: { children: "Changelog" },
} satisfies Meta<typeof UnderlineLinkText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standalone: Story = {
  name: "Standalone (self hover)",
  render: () => (
    <BodyText>
      <UnderlineLinkText>Changelog</UnderlineLinkText>
    </BodyText>
  ),
};

export const InTextLink: Story = {
  name: "In TextLink",
  render: () => (
    <TextLink asChild>
      <a href="#">
        <UnderlineLinkText>View the changelog</UnderlineLinkText>
      </a>
    </TextLink>
  ),
};

export const LargeDisplayType: Story = {
  name: "Large display type",
  parameters: {
    docs: {
      description: {
        story:
          "Hero-scale text. Because the thickness and offset are in `em`, the underline scales " +
          "proportionally with the text — it reads as the same weight here as it does in body copy.",
      },
    },
  },
  render: () => (
    <HeroText>
      <UnderlineLinkText>Read more</UnderlineLinkText>
    </HeroText>
  ),
};

export const InBodyCopy: Story = {
  name: "In body copy (wrapping + descenders)",
  render: () => (
    <div className="max-w-[18rem]">
      <BodyText>
        Inline in a paragraph the underline must wrap cleanly across lines and never clip the tails
        of descenders — hover{" "}
        <UnderlineLinkText>this piggyback jerky typography link</UnderlineLinkText> and confirm the
        g, y, p and j stay intact while the line sweeps.
      </BodyText>
    </div>
  ),
};

export const ControlledActive: Story = {
  name: "Controlled via active prop",
  render: function ControlledActiveStory() {
    const [active, setActive] = useState(false);
    return (
      <div className="flex flex-col items-start gap-4">
        <BodyText>
          <UnderlineLinkText active={active}>Changelog</UnderlineLinkText>
        </BodyText>
        <Button variant={ButtonVariant.secondary} onClick={() => setActive((v) => !v)}>
          Toggle sweep
        </Button>
      </div>
    );
  },
};
