import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef } from 'react';
import {
  DropdownTrigger,
  DropdownTriggerContent,
  TypeableDropdownTrigger,
  TextDropdownTrigger,
} from './DropdownTrigger';
import { TextDropdownSize } from './constants';

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

/* Focused via the component's own `inputRef` rather than React's `autoFocus`.
 * Storybook renders stories inside an `act` scope, and React's autoFocus commit
 * path trips "a component suspended inside an act scope" there — noise that has
 * nothing to do with this component. Focusing in an effect shows the same
 * chrome without it. */
function FocusedTypeableTrigger() {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    /* Deferred by a task, not called inline: Storybook commits stories inside an
     * `act` scope, and focusing during that commit trips React's "a component
     * suspended inside an act scope" warning — noise unrelated to this
     * component. A timer (not requestAnimationFrame, which is paused in a
     * background tab) lands the focus just after the commit. */
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <TypeableDropdownTrigger placeholder="Typing focus…" inputRef={inputRef} />
  );
}

export const TypeableFocused: Story = {
  render: () => <FocusedTypeableTrigger />,
};

export const Text: Story = {
  render: () => <TextDropdownTrigger>Options</TextDropdownTrigger>,
};

export const TextSmall: Story = {
  render: () => <TextDropdownTrigger size={TextDropdownSize.sm}>Filter</TextDropdownTrigger>,
};

export const AllTriggers: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4 w-60">
      <DropdownTrigger>Secondary trigger</DropdownTrigger>
      <TypeableDropdownTrigger placeholder="Typeable trigger" />
      <TextDropdownTrigger>Text trigger</TextDropdownTrigger>
      <TextDropdownTrigger size={TextDropdownSize.sm}>Text small</TextDropdownTrigger>
    </div>
  ),
};
