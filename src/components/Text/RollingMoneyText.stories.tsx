import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { ButtonVariant } from "../Button/constants";
import { BodyText, LabelText, TitleText } from "./BaseText";
import { RollingMoneyText } from "./RollingMoneyText";

const meta = {
  title: "Primitives/RollingMoneyText",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("$1,240.00");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <TitleText>
          <RollingMoneyText>{value}</RollingMoneyText>
        </TitleText>
        <div className="flex gap-2">
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => setValue("$1,240.00")}
          >
            Total
          </Button>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => setValue("$3,891.45")}
          >
            Row A
          </Button>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => setValue("$982.10")}
          >
            Row B
          </Button>
        </div>
      </div>
    );
  },
};

export const SmallCents: Story = {
  render: () => {
    const [value, setValue] = useState("$12,450.00");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <TitleText>
          <RollingMoneyText smallCents smallCentsComponent={LabelText}>
            {value}
          </RollingMoneyText>
        </TitleText>
        <BodyText className="text-text-secondary">
          Cents use LabelText via smallCentsComponent
        </BodyText>
        <div className="flex gap-2">
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => setValue("$12,450.00")}
          >
            Aggregate
          </Button>
          <Button
            variant={ButtonVariant.secondary}
            onClick={() => setValue("$8,102.37")}
          >
            Hover point
          </Button>
        </div>
      </div>
    );
  },
};
