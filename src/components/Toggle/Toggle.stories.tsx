import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ToggleSwitch, ToggleSwitchItem } from './Toggle';
import { ToggleSize, ToggleVariant } from './constants';
import { CheckIcon, CloseCancelIcon } from '../Icons';

const meta = {
  title: 'Inputs/ToggleSwitch',
  component: ToggleSwitch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(ToggleVariant),
    },
    size: {
      control: 'select',
      options: Object.values(ToggleSize),
    },
  },
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants = [ToggleVariant.primary, ToggleVariant.ghost] as const;

/** Figma Toggle Switch (826:2149) — text sizes. */
export const TextSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-rg">
      {variants.map((variant) =>
        [ToggleSize.standard, ToggleSize.sm].map((size) => (
          <ToggleSwitch key={`${variant}-${size}`} defaultValue="off" variant={variant} size={size}>
            <ToggleSwitchItem value="off" data-testid={`${variant}-${size}`}>Off</ToggleSwitchItem>
            <ToggleSwitchItem value="on">On</ToggleSwitchItem>
          </ToggleSwitch>
        )),
      )}
    </div>
  ),
};

/** Icon switches — `iconSm` is Figma "Icon Small": the 28px micro option. */
export const IconOnlySizes: Story = {
  render: () => (
    <div className="flex flex-col gap-rg">
      {variants.map((variant) =>
        [ToggleSize.icon, ToggleSize.iconMicro].map((size) => (
          <ToggleSwitch key={`${variant}-${size}`} defaultValue="no" variant={variant} size={size}>
            <ToggleSwitchItem value="no" aria-label="No" data-testid={`${variant}-${size}`}><CloseCancelIcon /></ToggleSwitchItem>
            <ToggleSwitchItem value="yes" aria-label="Yes"><CheckIcon /></ToggleSwitchItem>
          </ToggleSwitch>
        )),
      )}
    </div>
  ),
};

/** Figma "Custom" — N options, same 4px gap as the two-option switch. */
export const Custom: Story = {
  render: () => (
    <ToggleSwitch defaultValue="30" variant={ToggleVariant.ghost}>
      <ToggleSwitchItem value="30">30 Days</ToggleSwitchItem>
      <ToggleSwitchItem value="14">14 Days</ToggleSwitchItem>
      <ToggleSwitchItem value="7">7 Days</ToggleSwitchItem>
    </ToggleSwitch>
  ),
};

/**
 * Externally controlled. Clicking the selected option does nothing — the switch
 * never reports "" to onValueChange, so consumer state can't be cleared either.
 */
export const Controlled: Story = {
  render: function ControlledStory() {
    const [range, setRange] = useState('14');
    return (
      <div className="flex flex-col items-center gap-rg">
        <ToggleSwitch value={range} onValueChange={setRange} variant={ToggleVariant.primary}>
          <ToggleSwitchItem value="30" data-testid="ctl-30">30 Days</ToggleSwitchItem>
          <ToggleSwitchItem value="14" data-testid="ctl-14">14 Days</ToggleSwitchItem>
          <ToggleSwitchItem value="7" data-testid="ctl-7">7 Days</ToggleSwitchItem>
        </ToggleSwitch>
        <span data-testid="ctl-value">value: {JSON.stringify(range)}</span>
      </div>
    );
  },
};

/**
 * `ToggleVariant.unselected` keeps the shared unselected look even while an
 * option is the selected value — it never shows a primary or ghost fill.
 * Top row: set on the switch, so every option (Auto, Light, Dark) is
 * unselected-looking whichever is chosen. Bottom row: set on the Auto item
 * only, so Light and Dark still show the switch's primary fill when chosen.
 */
export const UnselectedVariant: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-rg">
      <ToggleSwitch defaultValue="auto" variant={ToggleVariant.unselected}>
        <ToggleSwitchItem value="auto" data-testid="unsel-all-auto">Auto</ToggleSwitchItem>
        <ToggleSwitchItem value="light" data-testid="unsel-all-light">Light</ToggleSwitchItem>
        <ToggleSwitchItem value="dark" data-testid="unsel-all-dark">Dark</ToggleSwitchItem>
      </ToggleSwitch>
      <ToggleSwitch defaultValue="auto" variant={ToggleVariant.primary}>
        <ToggleSwitchItem value="auto" variant={ToggleVariant.unselected} data-testid="unsel-selected">
          Auto
        </ToggleSwitchItem>
        <ToggleSwitchItem value="light" data-testid="unsel-primary">Light</ToggleSwitchItem>
        <ToggleSwitchItem value="dark">Dark</ToggleSwitchItem>
      </ToggleSwitch>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ToggleSwitch defaultValue="off" variant={ToggleVariant.primary} disabled>
      <ToggleSwitchItem value="off">Off</ToggleSwitchItem>
      <ToggleSwitchItem value="on">On</ToggleSwitchItem>
    </ToggleSwitch>
  ),
};

/** An item's size contradicts the switch's (default: inherited from the switch). */
export const ItemSizeOverride: Story = {
  render: () => (
    <ToggleSwitch defaultValue="a" variant={ToggleVariant.primary} size={ToggleSize.standard}>
      <ToggleSwitchItem value="a">Standard</ToggleSwitchItem>
      <ToggleSwitchItem value="b" size={ToggleSize.sm}>
        Small
      </ToggleSwitchItem>
    </ToggleSwitch>
  ),
};
