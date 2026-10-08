import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RollChangeText } from "./RollChangeText";
import { BodyText, LabelText } from "./BaseText";
import { FontWeights, RollDirection } from "./constants";

const meta = {
  title: "Text/RollChangeText",
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

export const DirectionUpVsDown: Story = {
  name: "Direction (up vs down)",
  args: { children: null },
  parameters: {
    docs: {
      description: {
        story:
          "`direction` flips the travel. `down` (default) settles the new value in from above; `up` " +
          "rises it in from below. Both counters below advance on the same interval.",
      },
    },
  },
  render: function DirectionStory() {
    const [n, setN] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => setN((v) => v + 1), 1500);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex gap-12">
        <div className="flex flex-col items-start gap-1">
          <LabelText className="uppercase tracking-wide opacity-40">Down (default)</LabelText>
          <RollChangeText changeKey={n} direction={RollDirection.down}>
            <BodyText>{n}</BodyText>
          </RollChangeText>
        </div>
        <div className="flex flex-col items-start gap-1">
          <LabelText className="uppercase tracking-wide opacity-40">Up</LabelText>
          <RollChangeText changeKey={n} direction={RollDirection.up}>
            <BodyText>{n}</BodyText>
          </RollChangeText>
        </div>
      </div>
    );
  },
};

const models = [
  { id: "gpt-fast", name: "Fast", weight: FontWeights.regular },
  { id: "gpt-balanced", name: "Balanced", weight: FontWeights.medium },
  { id: "gpt-max", name: "Max Quality", weight: FontWeights.semibold },
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
