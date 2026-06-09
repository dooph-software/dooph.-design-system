import type { Meta, StoryObj } from "@storybook/react";
import { SettingsIcon } from "../Icons";
import { Avatar, AvatarSize } from "./Avatar";

const LogoMark = () => (
  <svg viewBox="0 0 22 22" fill="none" aria-hidden>
    <circle cx="17" cy="17" r="3" fill="currentColor" className="text-accent" />
    <path
      d="M4.5 11.5c0-3.1 2.1-5.4 5-5.4 1.2 0 2.2.4 2.9 1.2V3.5h3.1v13h-2.9v-1.2c-.7.9-1.8 1.4-3.1 1.4-2.9 0-5-2.2-5-5.2Zm3.1 0c0 1.5 1 2.6 2.4 2.6s2.5-1.1 2.5-2.6S11.4 9 10 9s-2.4 1-2.4 2.5Z"
      fill="currentColor"
      className="text-logo"
    />
  </svg>
);

const meta = {
  title: "Bits & Pieces/Avatar",
  component: Avatar,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: Object.values(AvatarSize),
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    children: <LogoMark />,
  },
};

export const Small: Story = {
  args: {
    size: AvatarSize.small,
    children: <LogoMark />,
  },
};

export const WithIcon: Story = {
  args: {
    size: AvatarSize.small,
    children: <SettingsIcon />,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar>
        <LogoMark />
      </Avatar>
      <Avatar size={AvatarSize.small}>
        <LogoMark />
      </Avatar>
      <Avatar size={AvatarSize.small}>
        <SettingsIcon />
      </Avatar>
    </div>
  ),
};

export const WithCustomChildren: Story = {
  render: () => (
    <Avatar size={AvatarSize.small}>
      <span className="text-style-label text-text">⌘</span>
    </Avatar>
  ),
};
