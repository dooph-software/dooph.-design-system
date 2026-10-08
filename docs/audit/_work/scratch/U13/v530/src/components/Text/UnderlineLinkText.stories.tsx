import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { UnderlineLinkText } from "./UnderlineLinkText";
import { BodyText, HeroText } from "./BaseText";
import { TextLink } from "../TextLink";
import { Button, ButtonVariant } from "../Button";

const meta = {
  title: "Text/UnderlineLinkText",
  component: UnderlineLinkText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A sliding underline link decoration. The underline is present at rest; on hover it " +
          "wipes out to the right and immediately redraws in from the left. The line is a " +
          "`currentColor` gradient painted into `background`, so it tracks this element's own " +
          "`color` — including hover changes on an ancestor like TextLink. Put color on " +
          "UnderlineLinkText or above (not on a child). Positioned at `1em + offset` so it sits " +
          "like a native text-decoration underline. Tune via `thickness` / `offset` or the " +
          "`--ui-underline-link-*` tokens.",
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

export const Thickness: Story = {
  name: "Stroke weight (thickness prop)",
  parameters: {
    docs: {
      description: {
        story:
          "`thickness` sets the underline stroke weight — a number is px, or pass any CSS length " +
          "(e.g. `\"0.15em\"`).",
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <BodyText>
        <UnderlineLinkText>Default</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText thickness={2}>2px</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText thickness={4}>4px</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText thickness="0.2em">0.2em (scales with text)</UnderlineLinkText>
      </BodyText>
    </div>
  ),
};

export const Offset: Story = {
  name: "Gap under text (offset prop)",
  parameters: {
    docs: {
      description: {
        story:
          "`offset` is the distance below the em-square bottom. `0` sits flush at the em bottom; " +
          "negative pulls into the glyphs; larger positive values push further down.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <BodyText>
        <UnderlineLinkText offset={0}>offset 0</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText>Default token</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText offset="0.2em">offset 0.2em</UnderlineLinkText>
      </BodyText>
      <BodyText>
        <UnderlineLinkText offset="-0.05em">offset -0.05em (into glyphs)</UnderlineLinkText>
      </BodyText>
    </div>
  ),
};

export const InTextLink: Story = {
  name: "In TextLink (inherits hover color)",
  parameters: {
    docs: {
      description: {
        story:
          "Color lives on TextLink (the ancestor). UnderlineLinkText uses `currentColor`, so the " +
          "underline tracks TextLink's ghost → active color change on hover with no color prop.",
      },
    },
  },
  render: () => (
    <TextLink href="#">
      <UnderlineLinkText>View the changelog</UnderlineLinkText>
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
