import type { Meta, StoryObj } from "@storybook/react";
import { SendIcon } from "../Icons";
import { LabelText } from "../Text";
import { ShapeButton } from "./ShapeButton";
import { ShapeButtons, ShapeButtonVariant } from "./constants";

const meta = {
  title: "Buttons/ShapeButton",
  component: ShapeButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    shape: {
      control: "select",
      options: Object.values(ShapeButtons),
    },
    variant: {
      control: "inline-radio",
      options: Object.values(ShapeButtonVariant),
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof ShapeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {
  args: {
    shape: ShapeButtons.clover,
    variant: ShapeButtonVariant.prominent,
    children: <SendIcon />,
  },
};

export const Primary: Story = {
  args: {
    shape: ShapeButtons.squircle,
    variant: ShapeButtonVariant.primary,
    children: <SendIcon />,
  },
};

export const Disabled: Story = {
  args: {
    shape: ShapeButtons.clover,
    children: <SendIcon />,
    disabled: true,
  },
};

export const AllShapes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {Object.values(ShapeButtonVariant).map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          {Object.entries(ShapeButtons).map(([label, shape]) => (
            <div key={shape} className="flex flex-col items-center gap-2">
              <ShapeButton shape={shape} variant={variant}>
                <SendIcon />
              </ShapeButton>
              <LabelText className="text-text-secondary">{label}</LabelText>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {Object.values(ShapeButtonVariant).map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <ShapeButton shape={ShapeButtons.diamond} variant={variant}>
              <SendIcon />
            </ShapeButton>
            <LabelText className="text-text-secondary">
              {variant} · default
            </LabelText>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShapeButton shape={ShapeButtons.diamond} variant={variant} disabled>
              <SendIcon />
            </ShapeButton>
            <LabelText className="text-text-secondary">
              {variant} · disabled
            </LabelText>
          </div>
        </div>
      ))}
    </div>
  ),
};
