import type { Meta, StoryObj } from "@storybook/react";
import { SendIcon } from "../Icons";
import { ShapeButton } from "./ShapeButton";
import { ShapeButtons } from "./constants";

const meta = {
  title: "Buttons & inputs/ShapeButton",
  component: ShapeButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    shape: {
      control: "select",
      options: Object.values(ShapeButtons),
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof ShapeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Clover: Story = {
  args: { shape: ShapeButtons.clover, children: <SendIcon /> },
};

export const Cookie: Story = {
  args: { shape: ShapeButtons.cookie, children: <SendIcon /> },
};

export const Pentagon: Story = {
  args: { shape: ShapeButtons.pentagon, children: <SendIcon /> },
};

export const Gem: Story = {
  args: { shape: ShapeButtons.gem, children: <SendIcon /> },
};

export const Disabled: Story = {
  args: { shape: ShapeButtons.clover, children: <SendIcon />, disabled: true },
};

export const AllShapes: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      {Object.entries(ShapeButtons).map(([label, shape]) => (
        <div key={shape} className="flex flex-col items-center gap-2">
          <ShapeButton shape={shape}>
            <SendIcon />
          </ShapeButton>
          <span className="text-style-label text-text-secondary">{label}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <ShapeButton shape={ShapeButtons.gem}>
          <SendIcon />
        </ShapeButton>
        <span className="text-style-label text-text-secondary">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ShapeButton shape={ShapeButtons.gem} disabled>
          <SendIcon />
        </ShapeButton>
        <span className="text-style-label text-text-secondary">Disabled</span>
      </div>
    </div>
  ),
};
