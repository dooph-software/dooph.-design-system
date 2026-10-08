import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FancyToggleSwitch, FancyToggleSwitchItem } from './FancyToggleSwitch';
import { BodyText } from '../Text';
import {
  CreditCardIcon,
  GraphIcon,
  InvoiceIcon,
  TableIcon,
  ThreeColumnsIcon,
} from '../Icons';

const meta = {
  title: 'Inputs/FancyToggleSwitch',
  component: FancyToggleSwitch,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof FancyToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Figma Toggle Switch `Fancy` (907:3307). No item icon: the indicator is a
 * stroke-only ring that fills prominent and shows the DS check when chosen.
 * The chosen option has no hover or pressed look.
 */
export const Fancy: Story = {
  render: () => (
    <FancyToggleSwitch defaultValue="on">
      <FancyToggleSwitchItem value="on" data-testid="fancy-on">On</FancyToggleSwitchItem>
      <FancyToggleSwitchItem value="off" data-testid="fancy-off">Off</FancyToggleSwitchItem>
    </FancyToggleSwitch>
  ),
};

/**
 * Figma `Fancy+Icon` (907:3340). An item `icon` makes the indicator a filled
 * circle: grey with a dark icon, prominent with a white icon when chosen.
 */
export const WithIcons: Story = {
  render: () => (
    <FancyToggleSwitch defaultValue="pay">
      <FancyToggleSwitchItem value="pay" icon={<CreditCardIcon />} data-testid="icon-pay">
        Pay
      </FancyToggleSwitchItem>
      <FancyToggleSwitchItem value="receive" icon={<InvoiceIcon />} data-testid="icon-receive">
        Receive
      </FancyToggleSwitchItem>
    </FancyToggleSwitch>
  ),
};

/** Figma "Fancy Cusotm" (907:3387) is the same variant with N options. */
export const ManyOptions: Story = {
  render: () => (
    <FancyToggleSwitch defaultValue="columns">
      <FancyToggleSwitchItem value="columns" icon={<ThreeColumnsIcon />}>Columns</FancyToggleSwitchItem>
      <FancyToggleSwitchItem value="table" icon={<TableIcon />}>Table</FancyToggleSwitchItem>
      <FancyToggleSwitchItem value="graph" icon={<GraphIcon />}>Graph</FancyToggleSwitchItem>
    </FancyToggleSwitch>
  ),
};

/** Icon is per item, so one row can mix filled-icon and ring indicators. */
export const MixedIndicators: Story = {
  render: () => (
    <FancyToggleSwitch defaultValue="card">
      <FancyToggleSwitchItem value="card" icon={<CreditCardIcon />}>Card</FancyToggleSwitchItem>
      <FancyToggleSwitchItem value="later">Pay later</FancyToggleSwitchItem>
    </FancyToggleSwitch>
  ),
};

/**
 * Externally controlled, single select. Clicking the chosen option does
 * nothing — onValueChange never receives "", same as ToggleSwitch.
 */
export const Controlled: Story = {
  render: function ControlledStory() {
    const [plan, setPlan] = useState('monthly');
    return (
      <div className="flex flex-col items-center gap-rg">
        <FancyToggleSwitch value={plan} onValueChange={setPlan}>
          <FancyToggleSwitchItem value="monthly" data-testid="ctl-monthly">Monthly</FancyToggleSwitchItem>
          <FancyToggleSwitchItem value="yearly" data-testid="ctl-yearly">Yearly</FancyToggleSwitchItem>
        </FancyToggleSwitch>
        <BodyText data-testid="ctl-value">value: {JSON.stringify(plan)}</BodyText>
      </div>
    );
  },
};

/**
 * Disabled: the whole option fades to the standard disabled opacity, the
 * chosen one included (it keeps its selected paint). Rows 1–2 disable the whole
 * row, so the chosen option is disabled too, in both indicator modes. Row 3
 * disables only the chosen option; row 4 only an unchosen one.
 */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-rg">
      <FancyToggleSwitch defaultValue="on" disabled>
        <FancyToggleSwitchItem value="on">On</FancyToggleSwitchItem>
        <FancyToggleSwitchItem value="off">Off</FancyToggleSwitchItem>
      </FancyToggleSwitch>
      <FancyToggleSwitch defaultValue="pay" disabled>
        <FancyToggleSwitchItem value="pay" icon={<CreditCardIcon />} data-testid="disabled-icon-selected">
          Pay
        </FancyToggleSwitchItem>
        <FancyToggleSwitchItem value="receive" icon={<InvoiceIcon />}>Receive</FancyToggleSwitchItem>
      </FancyToggleSwitch>
      <FancyToggleSwitch defaultValue="pay">
        <FancyToggleSwitchItem value="pay" icon={<CreditCardIcon />} disabled>
          Pay
        </FancyToggleSwitchItem>
        <FancyToggleSwitchItem value="receive" icon={<InvoiceIcon />}>Receive</FancyToggleSwitchItem>
      </FancyToggleSwitch>
      <FancyToggleSwitch defaultValue="pay">
        <FancyToggleSwitchItem value="pay" icon={<CreditCardIcon />}>Pay</FancyToggleSwitchItem>
        <FancyToggleSwitchItem value="receive" icon={<InvoiceIcon />} disabled>
          Receive
        </FancyToggleSwitchItem>
      </FancyToggleSwitch>
    </div>
  ),
};
