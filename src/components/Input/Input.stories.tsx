import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
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
export const HasError: Story = { args: { placeholder: 'Error state', hasError: true } };
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
 * error. Number variants are fixed width by default, like the text variants.
 */
export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-[160px_160px_160px_160px] items-center gap-4 p-4">
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

/** Number variants are fixed width by default: they fill the container, content left-aligned. */
export const NumberFixedWidth: Story = {
  render: () => (
    <div className="flex w-60 flex-col gap-4 p-4">
      <Input variant={InputVariant.number} defaultValue="1" data-testid="n-short" />
      <Input variant={InputVariant.number} defaultValue="1,240,000.00" data-testid="n-long" />
      <Input variant={InputVariant.iconNumber} icon={<TagIcon />} defaultValue="7" />
      <Input variant={InputVariant.number} className="w-32" defaultValue="42" />
    </div>
  ),
};

/** `autoWidth` opts back in to hugging: a single digit is a square; the field grows as you type. */
export const NumberAutoWidth: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <Input variant={InputVariant.number} autoWidth defaultValue="1" data-testid="n-short" />
      <Input variant={InputVariant.number} autoWidth defaultValue="1,240,000.00" data-testid="n-long" />
      <Input variant={InputVariant.iconNumber} autoWidth icon={<TagIcon />} defaultValue="7" />
    </div>
  ),
};

/**
 * `format`: shown formatted with Intl.NumberFormat while blurred, raw while
 * focused. Type or paste without separators; `onValueChange` gets the raw string.
 * Entry is filtered: letters and symbols can't be typed, only one decimal
 * separator is accepted, and pasted text is cleaned ("12ab3.4.5" becomes "123.45").
 */
function FormattedNumbers() {
  const [raw, setRaw] = useState('1234567.89');
  return (
    <div className="flex w-60 flex-col gap-4 p-4">
      <Input variant={InputVariant.number} format locale="en-US" defaultValue="1234567" data-testid="f-en" />
      <Input variant={InputVariant.number} format locale="de-DE" defaultValue="1234567.5" data-testid="f-de" />
      <Input
        variant={InputVariant.iconNumber}
        icon={<TagIcon />}
        format={{ style: 'currency', currency: 'EUR' }}
        locale="de-DE"
        value={raw}
        onValueChange={setRaw}
        data-testid="f-currency"
      />
      <div className="text-style-mono">raw: {raw}</div>
    </div>
  );
}

export const NumberFormatted: Story = { render: () => <FormattedNumbers /> };

/**
 * `min` / `max`: a committed value outside the range (on blur) shows the error
 * state; the value is never clamped. The first field starts out of range, the
 * second uses `hasError={false}` to suppress the automatic error, and a `min`
 * of 0 means a minus sign can't be typed at all.
 */
export const NumberRange: Story = {
  name: 'Number — range',
  render: () => (
    <div className="flex w-60 flex-col gap-4 p-4">
      <Input variant={InputVariant.number} min={0} max={100} defaultValue="150" data-testid="r-out" />
      <Input variant={InputVariant.number} min={0} max={100} defaultValue="50" data-testid="r-in" />
      <Input variant={InputVariant.number} min={0} max={100} defaultValue="150" hasError={false} data-testid="r-suppressed" />
      <Input variant={InputVariant.number} min={-10} max={10} defaultValue="-5" data-testid="r-negative" />
    </div>
  ),
};
