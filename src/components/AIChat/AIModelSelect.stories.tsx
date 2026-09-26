import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../Menu";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../Tooltip";
import {
  AIModelSelectItem,
  AIModelSelectTrigger,
  AIModelTooltipContent,
  AIThinkingEffortSelector,
} from "./AIModelSelect";

/* A STORY-ONLY catalogue. The package ships no models, providers or effort
 * levels — this is the shape a consumer maps their own catalogue into. */
export const STORY_MODELS = [
  {
    id: "auto",
    label: "Auto",
    color: undefined,
    description: "Picks a model for each request.",
    capability: 60,
  },
  {
    id: "opus-5",
    label: "Claude Opus 5",
    color: "var(--ui-color-ai-anthropic)",
    description: "The most capable model. Best for complex, multi-step work.",
    capability: 100,
  },
  {
    id: "sonnet-5",
    label: "Claude Sonnet 5",
    color: "var(--ui-color-ai-anthropic)",
    description:
      "Dependable, straightforward and quick. Best for daily tasks and quick responses",
    capability: 30,
  },
  {
    id: "gemini-flash",
    label: "Gemini 3.8 Flash",
    color: "var(--ui-color-ai-gemini)",
    description: "Fast and inexpensive, for lightweight requests.",
    capability: 40,
  },
  {
    id: "gpt-sol",
    label: "GPT 5.6 Sol",
    color: "var(--ui-color-ai-openai)",
    description: "Strong general reasoning with long context.",
    capability: 80,
  },
] as const;

export const STORY_EFFORT_STEPS = [
  { value: "minimum", label: "Minimum" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

type StoryModelId = (typeof STORY_MODELS)[number]["id"];

/** The full Figma 761:3079 composition: effort, models, a consumer action. */
export function StoryModelSelect({
  modelId,
  onModelChange,
  effort,
  onEffortChange,
}: {
  modelId: StoryModelId;
  onModelChange: (id: StoryModelId) => void;
  effort: string;
  onEffortChange: (value: string) => void;
}) {
  const model = STORY_MODELS.find((m) => m.id === modelId) ?? STORY_MODELS[0];
  const effortLabel = STORY_EFFORT_STEPS.find((s) => s.value === effort)?.label;

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <AIModelSelectTrigger detail={effortLabel}>
            {model.label}
          </AIModelSelectTrigger>
        </DropdownMenuTrigger>
        {/* align="end": the trigger sits right-aligned and its effort label
            changes width as the slider moves — anchoring its LEFT edge would
            drag the open menu sideways on every step. */}
        <DropdownMenuContent align="end" sideOffset={4}>
          {/* Figma's panel is 250px — a width this consumer picks, via the
              section's own `width` prop. */}
          <DropdownMenuSection width={250}>
            <AIThinkingEffortSelector
              label="Thinking"
              labels={{ start: "Faster", end: "Smarter" }}
              steps={STORY_EFFORT_STEPS}
              value={effort}
              onValueChange={onEffortChange}
              color={model.color}
            />
          </DropdownMenuSection>
          <DropdownMenuSeparator />
          <DropdownMenuSection width={250}>
            <DropdownMenuRadioGroup
              value={modelId}
              onValueChange={(id) => onModelChange(id as StoryModelId)}
            >
              {STORY_MODELS.map((m) => (
                <Tooltip key={m.id}>
                  <TooltipTrigger asChild>
                    <AIModelSelectItem value={m.id} color={m.color}>
                      {m.label}
                    </AIModelSelectItem>
                  </TooltipTrigger>
                  <AIModelTooltipContent
                    side="left"
                    sideOffset={16}
                    title={m.label}
                    description={m.description}
                    capability={m.capability}
                    color={m.color}
                  />
                </Tooltip>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuItem className="text-ghost-fg">Edit models</DropdownMenuItem>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

const meta = {
  title: "AI Chat/Model Select",
  // The fixtures above are shared with the streaming demo, not stories.
  excludeStories: /^(STORY_|StoryModelSelect$)/,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 761:3079 — open the trigger; hover an item for its tooltip. */
export const FullMenu: Story = {
  render: function Render() {
    const [modelId, setModelId] = useState<StoryModelId>("opus-5");
    const [effort, setEffort] = useState("medium");
    return (
      <div className="flex h-[560px] items-start">
        <StoryModelSelect
          modelId={modelId}
          onModelChange={setModelId}
          effort={effort}
          onEffortChange={setEffort}
        />
      </div>
    );
  },
};

/** Figma 761:2502. */
export const Trigger: Story = {
  render: () => (
    <AIModelSelectTrigger detail="Medium">GPT 5.6 Sol</AIModelSelectTrigger>
  ),
};

/** Figma 761:2088. The slider takes the provider's colour, which contradicts
 * the prominent default. */
export const ThinkingEffort: Story = {
  render: function Render() {
    const [effort, setEffort] = useState("medium");
    return (
      <div className="flex w-[234px] flex-col gap-md">
        <AIThinkingEffortSelector
          label="Thinking"
          labels={{ start: "Faster", end: "Smarter" }}
          steps={STORY_EFFORT_STEPS}
          value={effort}
          onValueChange={setEffort}
        />
        <AIThinkingEffortSelector
          label="Thinking"
          labels={{ start: "Faster", end: "Smarter" }}
          steps={STORY_EFFORT_STEPS}
          value={effort}
          onValueChange={setEffort}
          color="var(--ui-color-ai-anthropic)"
        />
      </div>
    );
  },
};

/** Figma 761:2843, pinned open. */
export const ModelTooltip: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex h-[200px] items-start">
        <Tooltip open>
          <TooltipTrigger asChild>
            <span className="text-style-body text-text">Claude Sonnet 5</span>
          </TooltipTrigger>
          <AIModelTooltipContent
            side="bottom"
            title="Claude Sonnet 5"
            description="Dependable, straightforward and quick. Best for daily tasks and quick responses"
            capability={30}
            color="var(--ui-color-ai-anthropic)"
          />
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};
