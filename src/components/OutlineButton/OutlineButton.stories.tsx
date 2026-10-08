import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { LabelText } from "../Text";
import { OutlineButton } from "./OutlineButton";
import { IconSize, SearchIcon } from "../Icons";

const meta = {
  title: "Buttons/OutlineButton",
  component: OutlineButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    glowing: { control: "boolean" },
    themeInverse: { control: "boolean" },
    glowColor1: { control: "color" },
    glowColor2: { control: "color" },
  },
} satisfies Meta<typeof OutlineButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Find anything",
  },
};

export const WithIcon: Story = {
  render: () => (
    <OutlineButton>
      <SearchIcon size={IconSize.md} />
      Find anything
    </OutlineButton>
  ),
};

export const Disabled: Story = {
  args: { children: "Find anything", disabled: true },
};

/** themeInverse swaps the inner surface from secondary tokens to primary tokens. */
export const ThemeInverse: Story = {
  render: () => (
    <OutlineButton themeInverse>
      <SearchIcon size={IconSize.md} />
      Find anything
    </OutlineButton>
  ),
};

/**
 * Controlled glow — always lit without hover.
 * Orbs are bottom-anchored (original positions). Good for a persistent "lit" state
 * driven by app logic rather than pointer interaction.
 */
export const Glowing: Story = {
  args: { children: "Find anything", glowing: true },
};

/** Per-orb color overrides. Both orbs default to `--ui-prominent-color-alt`. */
export const CustomGlowColors: Story = {
  render: () => (
    <OutlineButton glowColor1="#c084fc" glowColor2="#42e6f5">
      <SearchIcon size={IconSize.md} />
      Custom glow
    </OutlineButton>
  ),
};

export const CustomAccent: Story = {
  render: () => (
    <div style={{ "--ui-prominent-color-alt": "#c084fc" } as React.CSSProperties}>
      <OutlineButton>
        <SearchIcon size={IconSize.md} />
        Custom accent token
      </OutlineButton>
    </div>
  ),
};

/** `asChild` renders the consumer's element as the inner surface; the orbs and label render inside it. */
export const AsChild: Story = {
  render: () => (
    <OutlineButton asChild>
      <a href="#find">Find anything</a>
    </OutlineButton>
  ),
};

/** A consumer's mouse handlers run AND the glow keeps tracking the cursor. */
export const ConsumerMouseHandlers: Story = {
  render: function Render() {
    const [moves, setMoves] = useState(0);
    return (
      <div className="flex flex-col items-center gap-sm">
        <OutlineButton onMouseMove={() => setMoves((n) => n + 1)}>
          Track me
        </OutlineButton>
        <LabelText>{`onMouseMove calls: ${moves}`}</LabelText>
      </div>
    );
  },
};
