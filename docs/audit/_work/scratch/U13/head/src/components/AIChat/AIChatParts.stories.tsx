import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";
import { BodyText, FontWeights } from "../Text";
import { AITextPart } from "./AITextPart";
import { AIThinkingPart } from "./AIThinkingPart";
import { AIToolPart } from "./AIToolPart";
import { AITurnSummary } from "./AITurnSummary";
import { ChatDivider } from "./ChatDivider";
import {
  AIThinkingPartState,
  AIToolPartState,
  AIToolPartVariant,
} from "./constants";
import { UserMessageHeader } from "./UserMessageHeader";

/* Every part at Figma's 418px transcript width. The copy in these stories is
 * the STORY's — the components render only what they are handed. */
const Column = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-[418px] flex-col gap-rg">{children}</div>
);

const meta = {
  title: "AI Chat/Parts",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* Plain elements — ds-chat-prose styles them exactly as it would a markdown
 * renderer's output. */
const TRANSCRIPT = (
  <>
    <p>
      The user wants to add standard technical drawing dimensions to the
      imported model.
    </p>
    <p>Let me verify the contents of the canvas.</p>
  </>
);

/** Figma 761:1342. */
export const TextPart: Story = {
  render: () => (
    <Column>
      <AITextPart>
        I’ll start by taking a look at the canvas and see what’s already there.
      </AITextPart>
    </Column>
  ),
};

const STREAM_BLOCKS = [
  <p key="a">I’ve looked over the housing. Here’s the plan:</p>,
  <ul key="b">
    <li>Front view — the bore and both flanges</li>
    <li>Section A–A through the bearing seat</li>
    <li>Top view — bolt-hole pattern only</li>
  </ul>,
  <p key="c">
    Tolerances default to <code>ISO 2768-m</code> unless you say otherwise.
  </p>,
];

/** `streamingAnimation` with NO markdown renderer — plain elements appended
 * block by block. Each block rises out of a blur as it mounts; the list
 * animates per item. Replay remounts the part. */
export const TextPartStreamingAnimation: Story = {
  render: function Render() {
    const [run, setRun] = useState(0);
    const [count, setCount] = useState(0);
    useEffect(() => {
      setCount(0);
      const timers = STREAM_BLOCKS.map((_, i) =>
        setTimeout(() => setCount(i + 1), 300 + i * 700),
      );
      return () => timers.forEach(clearTimeout);
    }, [run]);
    const streaming = count < STREAM_BLOCKS.length;
    return (
      <Column>
        <AITextPart key={run} streamingAnimation={streaming}>
          {STREAM_BLOCKS.slice(0, count)}
        </AITextPart>
        <div>
          <Button
            variant={ButtonVariant.secondary}
            size={ButtonSize.sm}
            onClick={() => setRun((r) => r + 1)}
          >
            Replay
          </Button>
        </div>
      </Column>
    );
  },
};

/** Figma 761:1329 — Active, Failure, Default (hover it for Hover), Skill. */
export const ToolPart: Story = {
  render: () => (
    <Column>
      <AIToolPart state={AIToolPartState.active} meta="1.1s • 122 tokens">
        Viewing ball bearing housing
      </AIToolPart>
      <AIToolPart state={AIToolPartState.error}>Failed to use tool</AIToolPart>
      <AIToolPart state={AIToolPartState.complete} meta="3.2s • 346 tokens">
        Viewed ball bearing housing
      </AIToolPart>
      <AIToolPart
        variant={AIToolPartVariant.skill}
        state={AIToolPartState.complete}
      >
        Read 2D technical drawings skill
      </AIToolPart>
    </Column>
  ),
};

/** Not in Figma: a failure CAN carry a reason, revealed on hover like any
 * settled meta — and a skill row ignores meta it is handed. */
export const ToolPartOverrides: Story = {
  render: () => (
    <Column>
      <AIToolPart state={AIToolPartState.error} meta="Host disconnected">
        Failed to use Draw line
      </AIToolPart>
      <AIToolPart
        variant={AIToolPartVariant.skill}
        state={AIToolPartState.complete}
        meta="this is never shown"
      >
        Read dimensioning practice skill
      </AIToolPart>
    </Column>
  ),
};

/** Figma 761:1345 — every Variant × Transcript Available × State. */
export const ThinkingPart: Story = {
  render: () => (
    <Column>
      <AIThinkingPart
        state={AIThinkingPartState.thinking}
        label="Thinking"
        meta="3s • 743 tokens"
      />
      <AIThinkingPart state={AIThinkingPartState.thought} label="Thought for 26s" />
      <AIThinkingPart
        state={AIThinkingPartState.thinking}
        label="Thinking"
        meta="3s"
      >
        {TRANSCRIPT}
      </AIThinkingPart>
      <AIThinkingPart state={AIThinkingPartState.thought} label="Thought for 26s">
        {TRANSCRIPT}
      </AIThinkingPart>
      <AIThinkingPart
        state={AIThinkingPartState.thought}
        label="Thought for 26s"
        defaultOpen
      >
        {TRANSCRIPT}
      </AIThinkingPart>
    </Column>
  ),
};

/** The disclosure driven from outside — open state lives in the story. */
export const ThinkingPartControlled: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <Column>
        <BodyText className="text-text-tertiary">
          open = {String(open)}
        </BodyText>
        <AIThinkingPart
          state={AIThinkingPartState.thought}
          label="Thought for 26s"
          open={open}
          onOpenChange={setOpen}
        >
          {TRANSCRIPT}
        </AIThinkingPart>
      </Column>
    );
  },
};

/** Figma 761:1368 — hover the row to reveal the copy button (Variant2). */
export const TurnSummary: Story = {
  render: () => (
    <Column>
      <AITurnSummary label="Worked for 1m 22s" meta="12k tokens" />
      <AITurnSummary
        label="Worked for 1m 22s"
        meta="12k tokens"
        copyValue="The assistant's full answer for this turn."
      />
    </Column>
  ),
};

/** Figma 854:1337. Stickiness is the consumer's wrapper, not the component's. */
export const UserMessage: Story = {
  render: () => (
    <Column>
      <UserMessageHeader>
        Take this model of a ball bearing housing and mark it up with standard
        technical drawing annotations and dimensions.
      </UserMessageHeader>
      <UserMessageHeader className="line-clamp-2">
        A consumer-applied clamp: this prompt is long enough to need it, and
        the component itself never truncates, because how much of a prompt to
        show is a product decision, not a design-system one.
      </UserMessageHeader>
    </Column>
  ),
};

/** Figma 761:2496 and 761:1453 — one component, two uses. */
export const Dividers: Story = {
  render: () => (
    <Column>
      <ChatDivider>Today</ChatDivider>
      <ChatDivider>August 2</ChatDivider>
      <ChatDivider>
        Switched to{" "}
        <BodyText as="span" fontWeight={FontWeights.medium}>
          Claude Opus 5
        </BodyText>{" "}
        Low
      </ChatDivider>
    </Column>
  ),
};
