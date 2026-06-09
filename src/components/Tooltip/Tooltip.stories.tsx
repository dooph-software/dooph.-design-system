import type { Meta, StoryObj } from "@storybook/react";
import { Button, ButtonSize, ButtonVariant } from "../Button";
import { HelpIcon, SettingsIcon } from "../Icons";
import { HotkeyIndicator } from "../HotkeyIndicator";
import {
  Tooltip,
  TooltipBody,
  TooltipContent,
  TooltipProvider,
  TooltipTitle,
  TooltipTrigger,
  TooltipTypes,
} from "./Tooltip";

const meta = {
  title: "Overlays/Tooltip",
  component: TooltipContent,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: Object.values(TooltipTypes),
    },
    themeInverse: { control: "boolean" },
    side: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof TooltipContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={ButtonVariant.ghost}>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Open documentation</TooltipContent>
    </Tooltip>
  ),
};

export const Rich: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={ButtonVariant.ghost}>Hover me</Button>
      </TooltipTrigger>
      <TooltipContent variant={TooltipTypes.rich}>
        <TooltipTitle>Command Palette</TooltipTitle>
        <TooltipBody>Search across all actions and settings</TooltipBody>
      </TooltipContent>
    </Tooltip>
  ),
};

export const Composable: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={ButtonVariant.ghost} size={ButtonSize.icon}>
          <SettingsIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent variant={TooltipTypes.complex}>
        <div className="flex items-center gap-3 p-3">
          <SettingsIcon />
          <div className="flex flex-col gap-1">
            <TooltipTitle>Settings</TooltipTitle>
            <HotkeyIndicator keys={["⌘", ","]} />
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
};

export const AllSides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-12">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant={ButtonVariant.secondary}>{side}</Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const OnIconButton: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size={ButtonSize.icon} variant={ButtonVariant.ghost}>
          <HelpIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Open documentation</TooltipContent>
    </Tooltip>
  ),
};

export const ThemeInverseDisabled: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={ButtonVariant.ghost}>Ambient theme</Button>
      </TooltipTrigger>
      <TooltipContent themeInverse={false}>
        Inherits the current theme
      </TooltipContent>
    </Tooltip>
  ),
};
