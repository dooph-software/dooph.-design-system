import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentType } from "react";
import {
  ArrowShape,
  CapsuleShape,
  CloverShape,
  CookieShape,
  DiamondShape,
  DoubleShape,
  EightLeafCloverShape,
  PentagonShape,
  PixircleShape,
  PuffShape,
  SquircleShape,
  StarShape,
  TripleShape,
} from "./index";
import { LabelText } from "../Text";

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
  { label: "Capsule", component: CapsuleShape },
  { label: "Clover", component: CloverShape },
  { label: "Cookie", component: CookieShape },
  { label: "Diamond", component: DiamondShape },
  { label: "Double", component: DoubleShape },
  { label: "Eight-leaf clover", component: EightLeafCloverShape },
  { label: "Pentagon", component: PentagonShape },
  { label: "Pixircle", component: PixircleShape },
  { label: "Puff", component: PuffShape },
  { label: "Squircle", component: SquircleShape },
  { label: "Star", component: StarShape },
  { label: "Triple", component: TripleShape },
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
    fillColor: "var(--ui-color-primary)",
    strokeWeight: 1,
  },
} satisfies Meta<ShapeProps>;

export default meta;
type Story = StoryObj<ShapeProps>;

const ShapeCell = ({
  label,
  Shape,
  size = 160,
  fillColor = "var(--ui-color-primary)",
}: {
  label: string;
  Shape: ComponentType<ShapeProps>;
  size?: number;
  fillColor?: string;
}) => (
  <div className="flex flex-col items-center gap-md rounded-normal border border-border-primary bg-surface-primary p-lg">
    <Shape size={size} strokeColor="transparent" fillColor={fillColor} />
    <LabelText className="text-text-secondary">{label}</LabelText>
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

export const Capsule: Story = {
  render: (args) => <CapsuleShape {...args} />,
};

export const Diamond: Story = {
  render: (args) => <DiamondShape {...args} />,
};

export const Double: Story = {
  render: (args) => <DoubleShape {...args} />,
};

export const EightLeafClover: Story = {
  render: (args) => <EightLeafCloverShape {...args} />,
};

export const Pentagon: Story = {
  render: (args) => <PentagonShape {...args} />,
};

export const Puff: Story = {
  render: (args) => <PuffShape {...args} />,
};

export const Pixircle: Story = {
  render: (args) => <PixircleShape {...args} />,
};

export const Squircle: Story = {
  render: (args) => <SquircleShape {...args} />,
};

export const Star: Story = {
  render: (args) => <StarShape {...args} />,
};

export const Triple: Story = {
  render: (args) => <TripleShape {...args} />,
};

export const AllShapes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-lg p-lg sm:grid-cols-3">
      {shapes.map(({ label, component: Shape }) => (
        <ShapeCell key={label} label={label} Shape={Shape} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-xxl p-lg">
      {[96, 144, 192].map((size) => (
        <div key={size} className="flex flex-col items-center gap-md">
          <SquircleShape
            size={size}
            strokeColor="transparent"
            fillColor="var(--ui-color-primary)"
          />
          <LabelText className="text-text-secondary">{size}px</LabelText>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-lg p-lg sm:grid-cols-3">
      {shapes.map(({ label, component: Shape }, index) => (
        <ShapeCell
          key={label}
          label={label}
          Shape={Shape}
          fillColor={
            index % 2 === 0 ? "var(--ui-color-primary)" : "var(--ui-prominent-color-alt)"
          }
        />
      ))}
    </div>
  ),
};

export const DefinedFillAndStroke: Story = {
  args: {
    size: 160,
    strokeColor: "var(--ui-prominent-color-alt)",
    fillColor: "var(--ui-color-primary)",
    strokeWeight: 2,
  },
  render: (args) => <SquircleShape {...args} />,
};
