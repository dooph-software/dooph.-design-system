import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button/Button";
import { ButtonVariant } from "../Button/constants";
import { BodyText, HeroText, LabelText, TitleText } from "./BaseText";
import { parseMoney } from "./rollingMoneyModel";
import { RollingMoneyText } from "./RollingMoneyText";

const meta = {
  title: "Primitives/RollingMoneyText",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/* Expected/actual table. This repo has no test runner, so this story IS the
 * test for the pure model: every row must read PASS. */
const CASES: Array<{
  input: string;
  prefix: string;
  int: string;
  cents: string;
  suffix: string;
}> = [
  { input: "$1,234.56", prefix: "$", int: "1234", cents: "56", suffix: "" },
  { input: "$982.10", prefix: "$", int: "982", cents: "10", suffix: "" },
  { input: "$12,450.00", prefix: "$", int: "12450", cents: "00", suffix: "" },
  { input: "-$5,746.31", prefix: "-$", int: "5746", cents: "31", suffix: "" },
  { input: "$1,234", prefix: "$", int: "1234", cents: "", suffix: "" },
  { input: "1234.5", prefix: "", int: "1234", cents: "5", suffix: "" },
  { input: "$1,234.", prefix: "$", int: "1234", cents: "", suffix: "" },
  { input: "$0.99", prefix: "$", int: "0", cents: "99", suffix: "" },
  { input: "$1.2M", prefix: "$", int: "1", cents: "2", suffix: "M" },
  { input: "—", prefix: "—", int: "", cents: "", suffix: "" },
];

export const ParseCases: Story = {
  render: () => (
    <div className="flex flex-col gap-1 p-4">
      {CASES.map((c) => {
        const got = parseMoney(c.input);
        const ok =
          got.prefix === c.prefix &&
          got.integerDigits.join("") === c.int &&
          got.centsDigits.join("") === c.cents &&
          got.suffix === c.suffix;
        return (
          <div key={c.input} className="flex items-baseline gap-3">
            <LabelText className={ok ? "text-text" : "text-error-primary"}>
              {ok ? "PASS" : "FAIL"}
            </LabelText>
            <BodyText>{c.input}</BodyText>
            <LabelText className="text-text-secondary">
              {`prefix=${JSON.stringify(got.prefix)} int=${JSON.stringify(
                got.integerDigits.join(""),
              )} cents=${JSON.stringify(
                got.centsDigits.join(""),
              )} suffix=${JSON.stringify(got.suffix)}`}
            </LabelText>
          </div>
        );
      })}
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
        Same cents role at two dollar sizes. The rise token is tuned for Title.
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
