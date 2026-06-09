import type { Meta, StoryObj } from "@storybook/react";
import { OutlineButton } from "./OutlineButton";

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle
      cx="7"
      cy="7"
      r="4.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M10.5 10.5L13 13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const meta = {
  title: "Buttons & inputs/OutlineButton",
  component: OutlineButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    glowing: { control: "boolean" },
    inverseTheme: { control: "boolean" },
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
      <SearchIcon />
      Find anything
    </OutlineButton>
  ),
};

export const Disabled: Story = {
  args: { children: "Find anything", disabled: true },
};

/** inverseTheme swaps the inner surface from secondary tokens to primary tokens. */
export const InverseTheme: Story = {
  render: () => (
    <OutlineButton inverseTheme>
      <SearchIcon />
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

/** Per-orb color overrides. Both orbs default to `--ui-accent-color`. */
export const CustomGlowColors: Story = {
  render: () => (
    <OutlineButton glowColor1="#c084fc" glowColor2="#42e6f5">
      <SearchIcon />
      Custom glow
    </OutlineButton>
  ),
};

export const CustomAccent: Story = {
  render: () => (
    <div style={{ "--ui-accent-color": "#c084fc" } as React.CSSProperties}>
      <OutlineButton>
        <SearchIcon />
        Custom accent token
      </OutlineButton>
    </div>
  ),
};
