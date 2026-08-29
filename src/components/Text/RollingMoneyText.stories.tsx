import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button/Button";
import { ButtonVariant } from "../Button/constants";
import { BodyText, HeroText, LabelText, TitleText } from "./BaseText";
import { RollingMoneyText } from "./RollingMoneyText";

const meta = {
  title: "Primitives/RollingMoneyText",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/* The shapes a consumer can hand the component, rendered live. Negative and
 * abbreviated values, a bare integer, and a sub-dollar amount all take the
 * same path as an ordinary figure — the prefix and suffix are simply whatever
 * non-digit characters bookend the string, so no format flag exists or is
 * needed. */
const FORMATS: Array<{ value: string; note: string }> = [
  { value: "$1,234.56", note: "standard" },
  { value: "$12,450.00", note: "separators derived from place value, never parsed" },
  { value: "-$5,746.31", note: "multi-character prefix" },
  { value: "$1,234", note: "no cents group" },
  { value: "$0.99", note: "sub-dollar" },
  { value: "$1.2M", note: "suffix preserved" },
];

export const Formats: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-sm p-4">
      {FORMATS.map((f) => (
        <div key={f.value} className="flex items-baseline gap-4">
          <TitleText className="w-[10ch]">
            <RollingMoneyText>{f.value}</RollingMoneyText>
          </TitleText>
          <LabelText className="text-text-secondary">{f.note}</LabelText>
        </div>
      ))}
    </div>
  ),
};

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("$1,240.00");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <TitleText>
          <RollingMoneyText>{value}</RollingMoneyText>
        </TitleText>
        <div className="flex gap-2">
          {["$1,240.00", "$3,891.45", "$2,507.62"].map((v) => (
            <Button
              key={v}
              variant={ButtonVariant.secondary}
              onClick={() => setValue(v)}
            >
              {v}
            </Button>
          ))}
        </div>
        <BodyText className="text-text-secondary">
          Same digit count. Press the same button twice, then alternate — every
          change must roll.
        </BodyText>
      </div>
    );
  },
};

export const MagnitudeChange: Story = {
  render: () => {
    const [value, setValue] = useState("$982.10");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <TitleText>
          <RollingMoneyText>{value}</RollingMoneyText>
        </TitleText>
        <div className="flex gap-2">
          {["$982.10", "$1,240.00", "$12,450.00"].map((v) => (
            <Button
              key={v}
              variant={ButtonVariant.secondary}
              onClick={() => setValue(v)}
            >
              {v}
            </Button>
          ))}
        </div>
        <BodyText className="text-text-secondary">
          Exercises wheels turning off zero and rolling out. Cycle up and down
          repeatedly — no phantom leading zero may remain.
        </BodyText>
      </div>
    );
  },
};

export const SmallCents: Story = {
  render: () => {
    const [value, setValue] = useState("$5,746.31");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <TitleText>
          <RollingMoneyText smallCents smallCentsComponent={LabelText}>
            {value}
          </RollingMoneyText>
        </TitleText>
        <div className="flex gap-2">
          {["$5,746.31", "$8,102.37", "$912.04"].map((v) => (
            <Button
              key={v}
              variant={ButtonVariant.secondary}
              onClick={() => setValue(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>
    );
  },
};

/* The cents/dollars ratio is set by whichever role is passed as
 * smallCentsComponent, NOT by the wrapping role — so --ui-rolling-money-cents-rise
 * can only be correct for one pairing at a time. This story exists to make that
 * drift visible; it is a known limitation, not a bug to silently patch. */
export const RoleScaling: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-md p-4">
      <TitleText>
        <RollingMoneyText smallCents smallCentsComponent={LabelText}>
          {"$5,746.31"}
        </RollingMoneyText>
      </TitleText>
      <HeroText>
        <RollingMoneyText smallCents smallCentsComponent={LabelText}>
          {"$5,746.31"}
        </RollingMoneyText>
      </HeroText>
      <BodyText className="text-text-secondary">
        Same cents role at two dollar sizes.{" "}
        --ui-rolling-money-cents-rise is tuned for Title.
      </BodyText>
    </div>
  ),
};

const ROWS = [
  { label: "Acquisition", amount: "$3,891.45" },
  { label: "Retention", amount: "$982.10" },
  { label: "Expansion", amount: "$12,450.00" },
  { label: "Services", amount: "$5,746.31" },
];
const TOTAL = "$23,069.86";

/* The motivating use case, and the one that catches "fires only every other
 * change": hovering back and forth between two rows. */
export const TableScrub: Story = {
  render: () => {
    const [amount, setAmount] = useState(TOTAL);
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <TitleText>
          <RollingMoneyText smallCents smallCentsComponent={LabelText}>
            {amount}
          </RollingMoneyText>
        </TitleText>
        <div
          className="flex flex-col items-start"
          onMouseLeave={() => setAmount(TOTAL)}
        >
          {ROWS.map((r) => (
            <BodyText
              key={r.label}
              className="cursor-default px-2 py-1"
              onMouseEnter={() => setAmount(r.amount)}
            >
              {r.label}
            </BodyText>
          ))}
        </div>
        <BodyText className="text-text-secondary">
          Hover rows. Alternate between two rows repeatedly — every crossing
          must animate.
        </BodyText>
      </div>
    );
  },
};
