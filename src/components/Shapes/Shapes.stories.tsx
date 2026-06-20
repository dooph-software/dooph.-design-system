import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import {
  ArrowShape,
  CloverShape,
  CookieShape,
  GemShape,
  PentagonShape,
  PuffShape,
} from "./index";

type ShapeProps = {
  size: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWeight?: number | string;
};

type ShapeExample = {
  label: string;
  component: ComponentType<ShapeProps>;
};

const shapes: ShapeExample[] = [
  { label: "Arrow", component: ArrowShape },
  { label: "Clover", component: CloverShape },
  { label: "Cookie", component: CookieShape },
  { label: "Gem", component: GemShape },
  { label: "Pentagon", component: PentagonShape },
  { label: "Puff", component: PuffShape },
];

const meta = {
  title: "Bits & Pieces/Shapes",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "number" },
    strokeColor: { control: "color" },
    fillColor: { control: "color" },
    strokeWeight: { control: "number" },
  },
  args: {
    size: 160,
    strokeColor: "transparent",
    fillColor: "var(--color-primary)",
    strokeWeight: 1,
  },
} satisfies Meta<ShapeProps>;

export default meta;
type Story = StoryObj<ShapeProps>;

const ShapeCell = ({
  label,
  Shape,
  size = 160,
  fillColor = "var(--color-primary)",
}: {
  label: string;
  Shape: ComponentType<ShapeProps>;
  size?: number;
  fillColor?: string;
}) => (
  <div className="flex flex-col items-center gap-3 rounded-standard border border-border bg-surface p-4">
    <Shape size={size} strokeColor="transparent" fillColor={fillColor} />
    <span className="text-style-label text-text-secondary">{label}</span>
  </div>
);

export const Arrow: Story = {
  render: (args) => <ArrowShape {...args} />,
};

export const Clover: Story = {
  render: (args) => <CloverShape {...args} />,
};

export const Cookie: Story = {
  render: (args) => <CookieShape {...args} />,
};

export const Gem: Story = {
  render: (args) => <GemShape {...args} />,
};

export const Pentagon: Story = {
  render: (args) => <PentagonShape {...args} />,
};

export const Puff: Story = {
  render: (args) => <PuffShape {...args} />,
};

export const AllShapes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
      {shapes.map(({ label, component: Shape }) => (
        <ShapeCell key={label} label={label} Shape={Shape} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6 p-4">
      {[96, 144, 192].map((size) => (
        <div key={size} className="flex flex-col items-center gap-3">
          <GemShape
            size={size}
            strokeColor="transparent"
            fillColor="var(--color-primary)"
          />
          <span className="text-style-label text-text-secondary">{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
      {shapes.map(({ label, component: Shape }, index) => (
        <ShapeCell
          key={label}
          label={label}
          Shape={Shape}
          fillColor={
            index % 2 === 0 ? "var(--color-primary)" : "var(--color-accent)"
          }
        />
      ))}
    </div>
  ),
};

export const DefinedFillAndStroke: Story = {
  args: {
    size: 160,
    strokeColor: "var(--color-accent)",
    fillColor: "var(--color-primary)",
    strokeWeight: 2,
  },
  render: (args) => <GemShape {...args} />,
};
