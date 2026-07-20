import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SliderContinuous, SliderStepped, SliderLabeled } from './Slider';
import { SliderVariant } from './constants';
import { LabelText } from '../Text';

const meta = {
  title: 'Buttons & inputs/Slider',
  component: SliderContinuous,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(SliderVariant),
    },
  },
} satisfies Meta<typeof SliderContinuous>;

export default meta;
type Story = StoryObj<typeof meta>;

const VALUES = [0, 25, 50, 75, 100];

export const ContinuousBrand: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      {VALUES.map((v) => (
        <div key={v} className="flex items-center gap-3">
          <LabelText className="w-8 text-text-tertiary">{v}</LabelText>
          <SliderContinuous
            variant={SliderVariant.brand}
            defaultValue={[v]}
          />
        </div>
      ))}
    </div>
  ),
};

export const ContinuousPrimary: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      {VALUES.map((v) => (
        <div key={v} className="flex items-center gap-3">
          <LabelText className="w-8 text-text-tertiary">{v}</LabelText>
          <SliderContinuous
            variant={SliderVariant.primary}
            defaultValue={[v]}
          />
        </div>
      ))}
    </div>
  ),
};

const STEP_VALUES = [0, 1, 2, 3, 4];

export const SteppedBrand: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      {STEP_VALUES.map((v) => (
        <div key={v} className="flex items-center gap-3">
          <LabelText className="w-8 text-text-tertiary">{v}</LabelText>
          <SliderStepped
            variant={SliderVariant.brand}
            min={0}
            max={4}
            step={1}
            defaultValue={[v]}
          />
        </div>
      ))}
    </div>
  ),
};

export const SteppedPrimary: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      {STEP_VALUES.map((v) => (
        <div key={v} className="flex items-center gap-3">
          <LabelText className="w-8 text-text-tertiary">{v}</LabelText>
          <SliderStepped
            variant={SliderVariant.primary}
            min={0}
            max={4}
            step={1}
            defaultValue={[v]}
          />
        </div>
      ))}
    </div>
  ),
};

export const LabeledContinuous: Story = {
  render: () => (
    <div className="w-64">
      <SliderLabeled
        variant={SliderVariant.brand}
        defaultValue={[50]}
        labels={{ start: 'Faster', end: 'Smarter' }}
      />
    </div>
  ),
};

export const LabeledStepped: Story = {
  render: () => (
    <div className="w-64">
      <SliderLabeled
        variant={SliderVariant.primary}
        stepped
        min={0}
        max={4}
        step={1}
        defaultValue={[2]}
        labels={{ start: 'Faster', end: 'Smarter' }}
      />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState([50]);
    return (
      <div className="flex w-64 items-center gap-3">
        <SliderContinuous
          variant={SliderVariant.brand}
          value={value}
          onValueChange={setValue}
        />
        <LabelText className="w-8 text-text-tertiary">{value[0]}</LabelText>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      <SliderContinuous
        variant={SliderVariant.brand}
        defaultValue={[50]}
        disabled
      />
      <SliderStepped
        variant={SliderVariant.primary}
        min={0}
        max={4}
        step={1}
        defaultValue={[2]}
        disabled
      />
    </div>
  ),
};

export const KeyboardInteraction: Story = {
  name: 'Keyboard interaction',
  parameters: {
    docs: {
      description: {
        story:
          'Focus the thumb (Tab) then use the Left/Right (or Up/Down) arrow keys to move the value by one step. Home/End jump to min/max. All keyboard behavior comes from Radix Slider — this story is a manual verification aid, not an automated test.',
      },
    },
  },
  render: () => (
    <div className="w-64">
      <SliderContinuous variant={SliderVariant.brand} defaultValue={[50]} />
    </div>
  ),
};
