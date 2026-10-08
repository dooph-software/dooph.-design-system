import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef } from 'react';
import { Input } from './Input';

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
