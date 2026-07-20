import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RollChangeText } from "./RollChangeText";
import { BodyText, LabelText, TextFontWeight } from "./BaseText";

const meta = {
  title: "Primitives/RollChangeText",
  component: RollChangeText,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "When content changes, the old text rolls down and blurs out while the new text rolls in from " +
          "above and settles into focus. Respects `prefers-reduced-motion` (animation classes are " +
          "`motion-safe:` scoped). Works in dark mode without changes — the roll effect has no color tokens " +
          "of its own; it only transforms/blurs whatever children are already correctly themed.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RollChangeText>;

export default meta;
type Story = StoryObj<typeof meta>;

const statuses = ["Queued", "Starting up", "Running", "Finalizing", "Complete"];

export const AutoCyclingStatus: Story = {
  name: "Auto-cycling status (interval)",
  args: { children: null },
  render: function AutoCyclingStatusStory() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((i) => (i + 1) % statuses.length);
      }, 1800);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex flex-col items-start gap-1">
        <LabelText className="uppercase tracking-wide opacity-40">Job status</LabelText>
        <RollChangeText changeKey={statuses[index]}>
          <BodyText>{statuses[index]}</BodyText>
        </RollChangeText>
      </div>
    );
  },
};

const models = [
  { id: "gpt-fast", name: "Fast", weight: TextFontWeight.regular },
  { id: "gpt-balanced", name: "Balanced", weight: TextFontWeight.medium },
  { id: "gpt-max", name: "Max Quality", weight: TextFontWeight.semibold },
];

export const ChangeKeyWithComplexChildren: Story = {
  name: "changeKey + complex children",
  args: { children: null },
  render: function ChangeKeyStory() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((i) => (i + 1) % models.length);
      }, 1800);
      return () => clearInterval(interval);
    }, []);

    const model = models[index];

    return (
      <div className="flex flex-col items-start gap-1">
        <LabelText className="uppercase tracking-wide opacity-40">Selected model</LabelText>
        <RollChangeText changeKey={model.id}>
          <BodyText fontWeight={model.weight}>{model.name}</BodyText>
        </RollChangeText>
      </div>
    );
  },
};
