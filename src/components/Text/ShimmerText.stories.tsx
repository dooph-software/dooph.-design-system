import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ShimmerText } from "./ShimmerText";
import { ButtonText, BodyText } from "./BaseText";
import { FontWeights } from "./constants";
import { Button, ButtonVariant } from "../Button";

const meta = {
  title: "Primitives/ShimmerText",
  component: ShimmerText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Masks an animated sheen across its children's glyphs (ChatGPT-style \"working\" indicator). " +
          "Shimmer tokens (`--ui-shimmer-base` / `--ui-shimmer-highlight`) adapt automatically in dark mode — " +
          "toggle the Storybook theme to confirm. Children must not set an explicit text color; ShimmerText " +
          "owns color while active via a clipped gradient.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ShimmerText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WrappingButtonText: Story = {
  name: "Wrapping ButtonText",
  render: () => (
    <ShimmerText>
      <ButtonText>Generating response…</ButtonText>
    </ShimmerText>
  ),
};

export const WrappingBodyText: Story = {
  name: "Wrapping BodyText",
  render: () => (
    <ShimmerText>
      <BodyText>Thinking through the request…</BodyText>
    </ShimmerText>
  ),
};

export const WrappingWithFontWeightOverride: Story = {
  name: "Wrapping BodyText (fontWeight override)",
  render: () => (
    <ShimmerText>
      <BodyText fontWeight={FontWeights.semibold}>Composing an answer…</BodyText>
    </ShimmerText>
  ),
};

export const ToggleOnOff: Story = {
  name: "Toggle on/off",
  render: function ToggleOnOffStory() {
    const [active, setActive] = useState(true);
    return (
      <div className="flex flex-col items-start gap-4">
        {active ? (
          <ShimmerText>
            <ButtonText>Working on it…</ButtonText>
          </ShimmerText>
        ) : (
          <ButtonText>Done.</ButtonText>
        )}
        <Button variant={ButtonVariant.secondary} onClick={() => setActive((v) => !v)}>
          <ButtonText>Toggle shimmer</ButtonText>
        </Button>
      </div>
    );
  },
};
