import type { Meta, StoryObj } from "@storybook/react";
import { BodyText, LabelText } from "./BaseText";
import { parseMoney } from "./rollingMoneyModel";

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
