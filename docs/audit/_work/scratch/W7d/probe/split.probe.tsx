import type { Meta, StoryObj } from "@storybook/react";
import { IconSize, PlusIcon } from "../../../../../../src/components/Icons";
import { SplitButton } from "../../../../../../src/components/SplitButton/SplitButton";
const meta = {
  title: "Buttons/SplitButton",
  component: SplitButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof SplitButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { render: () => <SplitButton>Save</SplitButton> };
export const WithIcon: Story = {
  render: () => (
    <SplitButton icon={<PlusIcon size={IconSize.rg} />}>New file</SplitButton>
  ),
};
