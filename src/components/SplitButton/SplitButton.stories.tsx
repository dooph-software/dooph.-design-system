import type { Meta, StoryObj } from "@storybook/react";
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonTrigger,
} from "./SplitButton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSection,
} from "../Menu/DropdownMenu";

const meta = {
  title: "Buttons & inputs/SplitButton",
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <SplitButton>Save</SplitButton>,
};

export const WithIcon: Story = {
  render: () => (
    <SplitButton
      icon={
        <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
          <path
            d="M7 2v10M2 7h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      }
    >
      New file
    </SplitButton>
  ),
};

export const Disabled: Story = {
  render: () => <SplitButton disabled>Save</SplitButton>,
};

export const WithDropdown: Story = {
  render: () => (
    <DropdownMenu>
      <div className="inline-flex">
        <SplitButtonAction>Save</SplitButtonAction>
        <DropdownMenuTrigger asChild>
          <SplitButtonTrigger />
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuItem>New file</DropdownMenuItem>
          <DropdownMenuItem>Open…</DropdownMenuItem>
          <DropdownMenuItem>Save</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
