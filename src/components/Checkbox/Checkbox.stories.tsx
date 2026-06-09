import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Checkbox,
  CheckboxChecked,
  CheckboxVariant,
  type CheckboxChecked as CheckboxCheckedValue,
} from './Checkbox';
import { LabelText } from '../Text';

const meta = {
  title: 'Buttons & inputs/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(CheckboxVariant),
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {
    variant: CheckboxVariant.brand,
  },
};

export const Checked: Story = {
  args: {
    checked: CheckboxChecked.checked,
    variant: CheckboxVariant.brand,
  },
};

export const Indeterminate: Story = {
  args: {
    checked: CheckboxChecked.indeterminate,
    variant: CheckboxVariant.brand,
  },
};

export const Primary: Story = {
  args: {
    checked: CheckboxChecked.checked,
    variant: CheckboxVariant.primary,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <label className="flex items-center gap-2">
      <Checkbox defaultChecked />
      <LabelText>Accept terms</LabelText>
    </label>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState<CheckboxCheckedValue>(
      CheckboxChecked.unchecked,
    );

    return (
      <label className="flex items-center gap-2">
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        <LabelText>
          {checked === CheckboxChecked.checked ? 'Enabled' : 'Disabled'}
        </LabelText>
      </label>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      {Object.values(CheckboxVariant).map((variant) => (
        <div key={variant} className="flex items-center gap-4">
          <LabelText className="w-14 capitalize text-text-secondary">
            {variant}
          </LabelText>
          <Checkbox variant={variant} />
          <Checkbox variant={variant} checked={CheckboxChecked.checked} />
          <Checkbox variant={variant} checked={CheckboxChecked.indeterminate} />
          <Checkbox variant={variant} disabled />
          <Checkbox
            variant={variant}
            checked={CheckboxChecked.checked}
            disabled
          />
        </div>
      ))}
    </div>
  ),
};
