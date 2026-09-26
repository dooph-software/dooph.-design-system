import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button";
import { ButtonSize, ButtonVariant } from "../Button/constants";
import {
  AIPlanIcon,
  AISkillIcon,
  AttachFileIcon,
  IconSize,
  PlusIcon,
} from "../Icons";
import { LoadingSpinnerColor } from "../LoadingSpinner/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuTrigger,
} from "../Menu";
import { BodyText } from "../Text";
import { AIContextGauge } from "./AIContextGauge";
import { AIModelSelectTrigger } from "./AIModelSelect";
import {
  AIPromptInput,
  AIPromptInputSubmit,
  AIPromptInputTextarea,
  AIPromptInputToolbar,
  AIPromptInputToolbarEnd,
  AIPromptInputToolbarStart,
} from "./AIPromptInput";

/** Figma 761:2844 — the + menu is a plain DropdownMenu; its items are the app's. */
function ActionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.secondary}
          size={ButtonSize.iconSm}
          aria-label="More actions"
        >
          <PlusIcon size={IconSize.md} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" sideOffset={4}>
        <DropdownMenuSection>
          <DropdownMenuItem>
            <AttachFileIcon size={IconSize.rg} />
            Attach files
          </DropdownMenuItem>
          <DropdownMenuItem>
            <AISkillIcon size={IconSize.rg} />
            Skills
          </DropdownMenuItem>
          <DropdownMenuItem>
            <AIPlanIcon size={IconSize.rg} />
            Plan
          </DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Composer({
  defaultValue,
  responding = false,
  used = 0,
  budget = 0,
}: {
  defaultValue?: string;
  responding?: boolean;
  used?: number;
  budget?: number;
}) {
  const [sent, setSent] = useState<string | null>(null);
  return (
    <div className="flex w-[418px] flex-col gap-sm">
      <AIPromptInput
        defaultValue={defaultValue}
        onSubmit={setSent}
        responding={responding}
        onStop={() => setSent("(stopped)")}
      >
        <AIPromptInputTextarea placeholder="Ask Aspect" />
        <AIPromptInputToolbar>
          <AIPromptInputToolbarStart>
            <ActionMenu />
            <AIContextGauge used={used} budget={budget} aria-label="Context used" />
          </AIPromptInputToolbarStart>
          <AIPromptInputToolbarEnd>
            <AIModelSelectTrigger detail="Medium">GPT 5.6 Sol</AIModelSelectTrigger>
            <AIPromptInputSubmit />
          </AIPromptInputToolbarEnd>
        </AIPromptInputToolbar>
      </AIPromptInput>
      {sent !== null ? (
        <BodyText className="text-text-tertiary">onSubmit → “{sent}”</BodyText>
      ) : null}
    </div>
  );
}

const meta = {
  title: "AI Chat/Prompt Input",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma Empty — ghost, disabled submit; no budget known yet, so the gauge is empty. */
export const Empty: Story = { render: () => <Composer /> };

/** Figma Filled — click into it for the focus ring. Enter sends, Shift+Enter breaks. */
export const Filled: Story = {
  render: () => (
    <Composer
      defaultValue="Take this model of a ball bearing housing and mark it up with standard technical drawing annotations and dimensions."
      used={18_000}
      budget={100_000}
    />
  ),
};

/** Figma Active — a response is in flight: submit is a stop button. */
export const Responding: Story = {
  render: () => <Composer responding used={42_000} budget={100_000} />,
};

/** Grows with its content to --ui-chat-prompt-max-height, then scrolls. */
export const LongPrompt: Story = {
  render: () => (
    <Composer
      defaultValue={Array.from(
        { length: 24 },
        (_, i) => `Line ${i + 1} of a long pasted prompt.`,
      ).join("\n")}
    />
  ),
};

/** The gauge's colour is the consumer's: tiers that contradict the primary
 * default, chosen at the call site. It is never clamped — the figures stay in
 * range because the consumer keeps them there. */
export const ContextGaugeColors: Story = {
  render: () => (
    <div className="flex items-center gap-rg">
      <AIContextGauge used={30} budget={100} />
      <AIContextGauge used={75} budget={100} color={LoadingSpinnerColor.prominent} />
      <AIContextGauge
        used={95}
        budget={100}
        color="var(--ui-color-danger-primary)"
      />
      <AIContextGauge used={50} budget={100} color="var(--ui-color-ai-anthropic)" />
    </div>
  ),
};
