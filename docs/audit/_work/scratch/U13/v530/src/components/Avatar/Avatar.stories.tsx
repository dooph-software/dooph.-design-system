import type { Meta, StoryObj } from "@storybook/react";
import { OrganizationIcon } from "../Icons";
import { Avatar, AvatarSize } from "./Avatar";

const LogoMark = () => (
  <svg
    width="255"
    height="255"
    viewBox="0 0 255 255"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M154.703 38.0255C153.795 66.185 153.341 95.6313 153.341 126.365C153.341 156.795 153.795 186.241 154.703 214.704H113.885V190.25C109.496 200.394 104.286 205.753 96.4263 210.327C88.5664 214.759 79.2775 216.975 68.5595 216.975C59.2705 216.975 45.5108 214.01 38.0796 208.72C30.6485 203.431 24.8608 196.283 20.7165 187.277C16.5722 178.128 14.5 168.121 14.5 157.257C14.5 146.535 15.9625 134.178 20.1068 124.743C24.2511 115.165 31.2317 104.415 38.6628 98.697C46.2369 92.8359 59.0182 89.9053 68.5929 89.9053C79.7397 89.9053 88.1363 92.9246 96.8878 98.4599C105.639 103.995 111.456 109.027 115.751 118.588C115.751 109.959 115.399 96.1612 114.793 77.0854C114.188 58.6152 113.885 45.5952 113.885 38.0255H154.703ZM85.6008 183.313C94.137 183.313 101.105 180.96 106.506 176.255C111.906 171.376 114.606 163.708 114.606 153.252C114.606 144.016 111.906 137.22 106.506 132.863C101.105 128.506 94.3112 126.328 86.1235 126.328C78.2841 126.328 71.6643 128.855 66.2638 133.909C61.0376 138.788 58.4245 145.236 58.4245 153.252C58.4245 162.14 60.8634 169.372 65.7412 174.948C70.619 180.525 77.2389 183.313 85.6008 183.313Z"
      fill="#0A0A0A"
    />
    <path
      d="M240.5 184.322C240.5 201.101 226.921 214.704 210.169 214.704C193.418 214.704 179.839 201.101 179.839 184.322C179.839 167.542 193.418 153.94 210.169 153.94C226.921 153.94 240.5 167.542 240.5 184.322Z"
      fill="#390EF8"
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
    children: <OrganizationIcon />,
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
        <OrganizationIcon />
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
