import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef } from 'react';
import { Input } from './Input';
import { InputVariant } from './constants';
import { TagIcon, UserIcon } from '../Icons';

const meta = {
  title: 'Inputs/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    hasError: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: 'Placeholder text' } };
export const WithValue: Story = { args: { defaultValue: 'Input value', placeholder: 'Placeholder' } };
export const Disabled: Story = { args: { placeholder: 'Disabled', disabled: true } };
export const Error: Story = { args: { placeholder: 'Error state', hasError: true } };
/* Focused via a ref after commit rather than React's `autoFocus`. Storybook
 * renders inside an `act` scope, and focusing during that commit trips React's
 * "a component suspended inside an act scope" warning — noise unrelated to
 * Input. See the same treatment in DropdownTrigger.stories. */
function FocusedErrorInput() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const id = window.setTimeout(() => ref.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, []);
  return <Input ref={ref} placeholder="Error with focus" hasError />;
}

export const ErrorFocused: Story = { render: () => <FocusedErrorInput /> };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-60 p-4">
      <Input placeholder="Default" />
      <Input defaultValue="With value" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Error" hasError />
      <FocusedErrorInput />
    </div>
  ),
};

/**
 * Figma `Input` — the four variants across placeholder / filled / disabled /
 * error. Number variants hug their value and never go below a square.
 */
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-[160px_auto_160px_auto] items-center gap-4 p-4">
      <Input placeholder="Username" data-testid="v-text" />
      <Input variant={InputVariant.number} placeholder="123.45" data-testid="v-number" />
      <Input variant={InputVariant.iconText} icon={<UserIcon />} placeholder="Username" data-testid="v-icon-text" />
      <Input variant={InputVariant.iconNumber} icon={<TagIcon />} placeholder="123.45" data-testid="v-icon-number" />

      <Input defaultValue="jacesimons14" />
      <Input variant={InputVariant.number} defaultValue="123.45" />
      <Input variant={InputVariant.iconText} icon={<UserIcon />} defaultValue="jacesimons14" />
      <Input variant={InputVariant.iconNumber} icon={<TagIcon />} defaultValue="123.45" />

      <Input placeholder="Username" disabled />
      <Input variant={InputVariant.number} placeholder="123.45" disabled />
      <Input variant={InputVariant.iconText} icon={<UserIcon />} placeholder="Username" disabled />
      <Input variant={InputVariant.iconNumber} icon={<TagIcon />} placeholder="123.45" disabled />

      <Input defaultValue="jace@!" hasError />
      <Input variant={InputVariant.number} defaultValue="12a" hasError />
      <Input variant={InputVariant.iconText} icon={<UserIcon />} defaultValue="jace@!" hasError />
      <Input variant={InputVariant.iconNumber} icon={<TagIcon />} defaultValue="12a" hasError />
    </div>
  ),
};

/** Number variant: a single digit is a square; the field grows as you type. */
export const NumberGrows: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <Input variant={InputVariant.number} defaultValue="1" data-testid="n-short" />
      <Input variant={InputVariant.number} defaultValue="1,240,000.00" data-testid="n-long" />
      <Input variant={InputVariant.iconNumber} icon={<TagIcon />} defaultValue="7" />
    </div>
  ),
};
