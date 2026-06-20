import type { Meta, StoryObj } from '@storybook/react';
import {
  DropdownTrigger,
  DropdownTriggerContent,
  TypeableDropdownTrigger,
  TextDropdownTrigger,
} from './DropdownTrigger';

const meta = {
  title: 'Menus/DropdownTriggers',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Secondary: Story = {
  render: () => <DropdownTrigger>Select option</DropdownTrigger>,
};

export const SecondaryWithContentWrapper: Story = {
  render: () => (
    <DropdownTrigger>
      <DropdownTriggerContent>
        <span>Primary label</span>
        <span className="text-text-tertiary">Meta</span>
      </DropdownTriggerContent>
    </DropdownTrigger>
  ),
};

export const SecondaryDisabled: Story = {
  render: () => <DropdownTrigger disabled>Disabled</DropdownTrigger>,
};

export const Typeable: Story = {
  render: () => <TypeableDropdownTrigger placeholder="Search or select…" />,
};

/** Menu-open chrome (border + ds-focus-ring), not keyboard focus — see TypeableFocused. */
export const TypeableOpen: Story = {
  render: () => (
    <TypeableDropdownTrigger placeholder="Menu open…" data-state="open" />
  ),
};

export const TypeableFocused: Story = {
  render: () => (
    <TypeableDropdownTrigger placeholder="Typing focus…" autoFocus />
  ),
};

export const Text: Story = {
  render: () => <TextDropdownTrigger>Options</TextDropdownTrigger>,
};

export const TextSmall: Story = {
  render: () => <TextDropdownTrigger size="sm">Filter</TextDropdownTrigger>,
};

export const AllTriggers: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4 w-60">
      <DropdownTrigger>Secondary trigger</DropdownTrigger>
      <TypeableDropdownTrigger placeholder="Typeable trigger" />
      <TextDropdownTrigger>Text trigger</TextDropdownTrigger>
      <TextDropdownTrigger size="sm">Text small</TextDropdownTrigger>
    </div>
  ),
};
