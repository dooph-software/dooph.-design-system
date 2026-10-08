import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyButton } from "./CopyButton";
import { CopyButtonVariant } from "./constants";
import { BodyText, MonoText } from "../Text";

const meta = {
  title: "Buttons/CopyButton",
  component: CopyButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(CopyButtonVariant),
    },
    value: { control: "text" },
  },
  args: { value: "npm install @dooph-software/design-system" },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Clicking the button writes `value` to the clipboard and swaps the icon
 * from clipboard to a checkmark. The checkmark reverts back to the
 * clipboard icon automatically after 2 seconds (`REVERT_MS`), even if the
 * button is clicked again before the revert fires — the timer resets.
 */
export const Ghost: Story = {
  args: { variant: CopyButtonVariant.ghost },
};

export const Secondary: Story = {
  args: { variant: CopyButtonVariant.secondary },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-lg p-lg">
      <CopyButton variant={CopyButtonVariant.ghost} value="ghost-value" />
      <CopyButton variant={CopyButtonVariant.secondary} value="secondary-value" />
    </div>
  ),
};

/**
 * Demonstrates the copied-value feedback loop: the code snippet below is
 * copied to the clipboard on click, and the last copied value is echoed
 * back in the page so the click can be verified without leaving Storybook
 * or inspecting the OS clipboard. The button's own aria-live region also
 * announces "Copied" for two seconds — inspect the accessibility tree or
 * screen reader output to confirm.
 */
export const CopiedValueFeedback: Story = {
  render: () => {
    function Demo() {
      const [lastCopied, setLastCopied] = useState<string | null>(null);
      const snippet = "npx create-dooph-app@latest";

      return (
        <div className="flex flex-col items-start gap-md p-lg">
          <div className="flex items-center gap-sm rounded-tight border border-solid border-secondary-border bg-secondary px-md py-sm">
            <MonoText as="code">{snippet}</MonoText>
            <CopyButton
              variant={CopyButtonVariant.ghost}
              value={snippet}
              onCopied={setLastCopied}
            />
          </div>
          <BodyText as="p">
            {lastCopied ? `Copied: "${lastCopied}"` : "Nothing copied yet."}
          </BodyText>
        </div>
      );
    }
    return <Demo />;
  },
};
