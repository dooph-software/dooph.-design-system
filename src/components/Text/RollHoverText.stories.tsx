import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RollHoverText } from "./RollHoverText";
import { RollDirection } from "./constants";
import { ButtonText, BodyText, HeroText } from "./BaseText";
import { Button, ButtonVariant } from "../Button";
import { OutlineButton } from "../OutlineButton";

const meta = {
  title: "Primitives/RollHoverText",
  component: RollHoverText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "On hover, each character rolls in place on a shallow 3D barrel and blurs through the " +
          "rotation, staggered so many characters are mid-roll at once. Un-hovering reverses the " +
          "motion from wherever it currently sits — flick the pointer in and out to see it retarget " +
          "mid-roll. The text never changes, so every character keeps its own slot. " +
          "Triggers on its own `:hover`, an ancestor `.group:hover`, or the `active` prop. " +
          "Tune via `--ui-roll-hover-duration` / `--ui-roll-hover-stagger` / `--ui-roll-hover-blur` / " +
          "`--ui-roll-hover-depth`; the duration-to-stagger ratio (~1:14) is what makes it read as " +
          "one travelling wave rather than discrete letter-by-letter flips.",
      },
    },
  },
  tags: ["autodocs"],
  args: { children: "Deploy now" },
} satisfies Meta<typeof RollHoverText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InButton: Story = {
  name: "In Button",
  render: () => (
    <Button className="group">
      <ButtonText>
        <RollHoverText>Deploy now</RollHoverText>
      </ButtonText>
    </Button>
  ),
};

export const InOutlineButton: Story = {
  name: "In OutlineButton",
  render: () => (
    <OutlineButton>
      <ButtonText>
        <RollHoverText>Deploy now</RollHoverText>
      </ButtonText>
    </OutlineButton>
  ),
};

export const Standalone: Story = {
  name: "Standalone (self hover)",
  render: () => (
    <ButtonText>
      <RollHoverText>Deploy now</RollHoverText>
    </ButtonText>
  ),
};

export const LargeDisplayType: Story = {
  name: "Large display type",
  parameters: {
    docs: {
      description: {
        story:
          "Hero-scale text (36px, ~2.6× button size). Because `--ui-roll-hover-depth` and " +
          "`--ui-roll-hover-perspective` are both in `em`, the depth-to-perspective ratio is " +
          "identical here and at button size — the roll should read exactly as subtle as it does " +
          "in the Button story, just larger. A px perspective would make this version look overdone.",
      },
    },
  },
  render: () => (
    <HeroText>
      <RollHoverText>Deploy now</RollHoverText>
    </HeroText>
  ),
};

export const InBodyCopy: Story = {
  name: "In body copy (wrapping + descenders)",
  render: () => (
    <div className="max-w-[18rem]">
      <BodyText>
        Inline in a paragraph the roll must never break a word across lines, and it must not clip
        descenders — hover{" "}
        <RollHoverText>Deploy piggyback jerky</RollHoverText> and confirm the tails of the g, y, p
        and j stay intact while the letters roll.
      </BodyText>
    </div>
  ),
};

export const DirectionUpVsDown: Story = {
  name: "Direction (up vs down)",
  parameters: {
    docs: {
      description: {
        story:
          "`direction` flips the barrel roll. `up` (default) rolls each glyph upward; `down` rolls it " +
          "downward. Hover each to compare.",
      },
    },
  },
  render: () => (
    <div className="flex gap-12">
      <HeroText>
        <RollHoverText direction={RollDirection.up}>Upward</RollHoverText>
      </HeroText>
      <HeroText>
        <RollHoverText direction={RollDirection.down}>Downward</RollHoverText>
      </HeroText>
    </div>
  ),
};

export const ControlledActive: Story = {
  name: "Controlled via active prop",
  render: function ControlledActiveStory() {
    const [active, setActive] = useState(false);
    return (
      <div className="flex flex-col items-start gap-4">
        <ButtonText>
          <RollHoverText active={active}>Deploy now</RollHoverText>
        </ButtonText>
        <Button variant={ButtonVariant.secondary} onClick={() => setActive((v) => !v)}>
          <ButtonText>Toggle roll</ButtonText>
        </Button>
      </div>
    );
  },
};
