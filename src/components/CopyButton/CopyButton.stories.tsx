import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CopyButton } from "./CopyButton";
import { CopyButtonVariant } from "./constants";

const meta = {
  title: "Buttons & inputs/CopyButton",
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
  args: { variant: CopyButtonVariant.ghost, value: "npm install @dooph-software/design-system" },
};

export const Secondary: Story = {
  args: { variant: CopyButtonVariant.secondary, value: "npm install @dooph-software/design-system" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
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
        <div className="flex flex-col items-start gap-3 p-4">
          <div className="flex items-center gap-2 rounded-tight border border-solid border-secondary-border bg-secondary px-3 py-2">
            <code className="text-style-body">{snippet}</code>
            <CopyButton
              variant={CopyButtonVariant.ghost}
              value={snippet}
              onCopied={setLastCopied}
            />
          </div>
          <p className="text-style-body">
            {lastCopied ? `Copied: "${lastCopied}"` : "Nothing copied yet."}
          </p>
        </div>
      );
    }
    return <Demo />;
  },
};
