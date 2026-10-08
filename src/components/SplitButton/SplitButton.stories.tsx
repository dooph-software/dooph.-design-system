import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonGroup,
  SplitButtonTrigger,
} from "./SplitButton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSection,
} from "../Menu/DropdownMenu";
import { IconSize, PlusIcon } from "../Icons";

const meta = {
  title: "Buttons/SplitButton",
  component: SplitButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <SplitButton>Save</SplitButton>,
};

export const WithIcon: Story = {
  render: () => (
    <SplitButton
      icon={<PlusIcon size={IconSize.rg} />}
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
      <SplitButtonGroup>
        <SplitButtonAction>Save</SplitButtonAction>
        <DropdownMenuTrigger asChild>
          <SplitButtonTrigger aria-label="More save options" />
        </DropdownMenuTrigger>
      </SplitButtonGroup>
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
