import type { Meta, StoryObj } from '@storybook/react';
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
    <div className="flex flex-col gap-sm">
      {variants.map((variant) =>
        [ToggleSize.default, ToggleSize.sm].map((size) => (
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
export const IconSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-sm">
      {variants.map((variant) =>
        [ToggleSize.icon, ToggleSize.iconSm].map((size) => (
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
      <div className="flex flex-col items-center gap-sm">
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

export const Disabled: Story = {
  render: () => (
    <ToggleSwitch defaultValue="off" variant={ToggleVariant.primary} disabled>
      <ToggleSwitchItem value="off">Off</ToggleSwitchItem>
      <ToggleSwitchItem value="on">On</ToggleSwitchItem>
    </ToggleSwitch>
  ),
};
