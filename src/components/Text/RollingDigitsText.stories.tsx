import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Button } from "../Button/Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";
import { BaseText, BodyText, LabelText, TitleText } from "./BaseText";
import { FontWeights } from "./constants";
import { RollingDigitsText } from "./RollingDigitsText";

const meta = {
  title: "Primitives/RollingDigitsText",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/* Every story frames the figure the same way so the demos are comparable. */
function Figure({ children }: { children: string }) {
  return (
    <BaseText fontSize={28} fontWeight={FontWeights.medium}>
      <RollingDigitsText>{children}</RollingDigitsText>
    </BaseText>
  );
}

function Values({
  values,
  value,
  onPick,
}: {
  values: string[];
  value: string;
  onPick: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => (
        <Button
          key={v}
          size={ButtonSize.sm}
          variant={
            v === value ? ButtonVariant.primary : ButtonVariant.secondary
          }
          onClick={() => onPick(v)}
        >
          {v}
        </Button>
      ))}
    </div>
  );
}

function Demo({
  values,
  caption,
  smallDecimals = false,
}: {
  values: string[];
  caption: string;
  smallDecimals?: boolean;
}) {
  const [value, setValue] = useState(values[0]);
  return (
    <div className="flex flex-col items-start gap-md p-4">
      <BaseText fontSize={28} fontWeight={FontWeights.medium}>
        {smallDecimals ? (
          <RollingDigitsText smallDecimals smallDecimalsComponent={LabelText}>
            {value}
          </RollingDigitsText>
        ) : (
          <RollingDigitsText>{value}</RollingDigitsText>
        )}
      </BaseText>
      <Values values={values} value={value} onPick={setValue} />
      <BodyText className="max-w-[46ch] text-text-secondary">{caption}</BodyText>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Demo
      values={["$1,240.00", "$3,891.45", "$2,507.62"]}
      caption="Same digit count throughout: only the wheels turn, and the figure never
        changes width."
    />
  ),
};

/* The behaviour this component was rebuilt for. Crossing a power of ten adds or
 * removes a wheel AND its grouping separator; both open and collapse from zero
 * width rather than appearing at full width, so the figure grows continuously
 * instead of snapping. */
export const DigitCountChange: Story = {
  render: () => (
    <Demo
      values={["$9.99", "$99.99", "$999.99", "$1,240.00", "$12,450.00"]}
      caption="Step up and down the magnitudes. Each added place opens from zero
        width while it fades in; each departing one collapses where it stands.
        The comma belongs to the wheel it trails, so it leaves with it."
    />
  ),
};

/* Decimals are their own strip, reconciled independently — a change confined to
 * one side must leave the other alone. Losing them entirely is the case that
 * used to unmount the group before it could animate. */
export const DecimalsAppearAndLeave: Story = {
  render: () => (
    <Demo
      values={["$5", "$5.2", "$5.25", "$5.250"]}
      caption="The decimal point opens with its group and collapses with it. Going
        back to a bare integer is a visible exit, not an unmount."
    />
  ),
};

export const Suffixes: Story = {
  render: () => (
    <Demo
      values={["1.2M", "16.3M", "43.2M", "62.3k"]}
      caption="Prefix and suffix are simply the non-digit runs that bookend the
        string — no format flag exists or is needed. Note the suffix itself swaps
        without animating; only digits roll."
    />
  ),
};

export const SmallDecimals: Story = {
  render: () => (
    <Demo
      smallDecimals
      values={["$5,746.31", "$8,102.37", "$912.04", "$74.50"]}
      caption="Decimals rendered through LabelText, raised and reduced. The size
        comes from --ui-rolling-digits-decimals-size in em of the integers, so the
        proportion holds at every figure size; the passed role supplies family,
        weight and tracking."
    />
  ),
};

/* The shapes a consumer can hand the component, rendered live and static. */
const FORMATS: Array<{ value: string; note: string }> = [
  { value: "$1,234.56", note: "standard" },
  { value: "$12,450.00", note: "separators derived from place, never parsed" },
  { value: "-$5,746.31", note: "multi-character prefix" },
  { value: "1,234", note: "no decimals group" },
  { value: "$0.99", note: "sub-unit" },
  { value: "1.2M", note: "suffix preserved" },
  { value: "98.6%", note: "not money at all" },
];

export const Formats: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-sm p-4">
      {FORMATS.map((f) => (
        <div key={f.value} className="flex items-baseline gap-4">
          <BaseText
            fontSize={18}
            fontWeight={FontWeights.medium}
            className="w-[11ch]"
          >
            <RollingDigitsText>{f.value}</RollingDigitsText>
          </BaseText>
          <LabelText className="text-text-secondary">{f.note}</LabelText>
        </div>
      ))}
    </div>
  ),
};

/* The figure inherits typography from whatever wraps it, and the 1ch slots
 * resolve against that size — so the same component is correct from label to
 * hero with no size prop. */
export const Scales: Story = {
  render: () => {
    const [value, setValue] = useState("$982.10");
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <LabelText>
          <RollingDigitsText>{value}</RollingDigitsText>
        </LabelText>
        <BodyText>
          <RollingDigitsText>{value}</RollingDigitsText>
        </BodyText>
        <TitleText>
          <RollingDigitsText>{value}</RollingDigitsText>
        </TitleText>
        <Values
          values={["$982.10", "$1,240.00", "$12,450.00"]}
          value={value}
          onPick={setValue}
        />
      </div>
    );
  },
};

const ROWS = [
  { label: "Acquisition", amount: "$3,891.45" },
  { label: "Retention", amount: "$982.10" },
  { label: "Expansion", amount: "$12,450.00" },
  { label: "Services", amount: "$5,746.31" },
];
const TOTAL = "$23,069.86";

/* The motivating use case: a total that follows the pointer. Rows differ in
 * digit count on purpose, so scrubbing exercises enters and exits back to back
 * and interrupts them mid-flight. */
export const TableScrub: Story = {
  render: () => {
    const [amount, setAmount] = useState(TOTAL);
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <BaseText fontSize={28} fontWeight={FontWeights.medium}>
          <RollingDigitsText smallDecimals smallDecimalsComponent={LabelText}>
            {amount}
          </RollingDigitsText>
        </BaseText>
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
          Hover the rows; leave to return to the total.
        </BodyText>
      </div>
    );
  },
};

/* A ticker crosses magnitudes continuously and at a rate that guarantees
 * changes land while the previous animation is still running — the state the
 * component has to survive without stranding a wheel. */
export const LiveTicker: Story = {
  render: () => {
    const [cents, setCents] = useState(87_432);
    useEffect(() => {
      const id = window.setInterval(
        () =>
          setCents((c) =>
            Math.max(80, Math.round(c * (1 + (Math.random() - 0.48) * 0.35))),
          ),
        700,
      );
      return () => window.clearInterval(id);
    }, []);
    const value = (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    return (
      <div className="flex flex-col items-start gap-md p-4">
        <Figure>{value}</Figure>
        <BodyText className="max-w-[46ch] text-text-secondary">
          Random walk every 700ms, wide enough to cross magnitudes. Watch the
          width: it should only ever glide.
        </BodyText>
      </div>
    );
  },
};
