import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SliderContinuous, SliderStepped, SliderLabeled } from './Slider';
import { SliderVariant } from './constants';
import { DS_COLOR_TOKENS } from '../../utils/color';
import { LabelText } from '../Text';

const meta = {
  title: 'Inputs/Slider',
  component: SliderContinuous,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: Object.values(SliderVariant),
    },
    color: {
      control: 'select',
      options: Object.keys(DS_COLOR_TOKENS),
    },
    stepColor: {
      control: 'select',
      options: Object.keys(DS_COLOR_TOKENS),
    },
  },
} satisfies Meta<typeof SliderContinuous>;

export default meta;
type Story = StoryObj<typeof meta>;

const VALUES = [0, 25, 50, 75, 100];

export const Continuous: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      {VALUES.map((v) => (
        <div key={v} className="flex items-center gap-3">
          <LabelText className="w-8 text-text-tertiary">{v}</LabelText>
          <SliderContinuous defaultValue={[v]} />
        </div>
      ))}
    </div>
  ),
};

const STEP_VALUES = [0, 1, 2, 3, 4];

export const Stepped: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      {STEP_VALUES.map((v) => (
        <div key={v} className="flex items-center gap-3">
          <LabelText className="w-8 text-text-tertiary">{v}</LabelText>
          <SliderStepped min={0} max={4} step={1} defaultValue={[v]} />
        </div>
      ))}
    </div>
  ),
};

export const Variants: Story = {
  name: 'Variants (paint bundles)',
  parameters: {
    docs: {
      description: {
        story:
          '`variant` selects three paints at once — the default hue, the active ' +
          "track's opacity, and the active step dot's colour. They are not " +
          'derivable from one another: the track is the hue at a ' +
          'variant-specific alpha, while the dot is composed from the CONTENT ' +
          'paint so it stays legible ON the filled track. Compare the dots on ' +
          'the two stepped rows.',
      },
    },
  },
  render: () => (
    <div className="flex w-64 flex-col gap-6">
      {/* The two BUILT-IN palettes. `custom` is deliberately absent: it has no
          palette of its own, so it cannot be mapped over without a colour —
          `Object.values(SliderVariant)` here is a compile error, which is the
          discriminated union doing its job. */}
      {([SliderVariant.primary, SliderVariant.prominent] as const).map((v) => (
        <div key={v} className="flex flex-col gap-2">
          <LabelText className="text-text-tertiary">{v}</LabelText>
          <SliderContinuous variant={v} defaultValue={[60]} />
          <SliderStepped
            variant={v}
            min={0}
            max={4}
            step={1}
            defaultValue={[2]}
          />
        </div>
      ))}
    </div>
  ),
};

export const CustomVariant: Story = {
  name: 'Custom variant (color + stepColor)',
  parameters: {
    docs: {
      description: {
        story:
          '`variant="custom"` has no palette of its own and REQUIRES `color`. ' +
          'Omitting it is a compile error — `SliderProps` is a discriminated ' +
          'union — and `SliderBase` throws if the value arrives anyway, which ' +
          'is the case a JavaScript consumer or a runtime-computed `variant` ' +
          'lands in. `stepColor` completes the palette; left off, the step dot ' +
          'falls back to primary’s so the slider still reads correctly. ' +
          '**Watch the dots on the filled side of the handle** — the first two ' +
          'rows are the same orange track and differ only in `stepColor`. The ' +
          'magenta is deliberately garish: the point is to make the knob ' +
          'obvious, not to suggest a palette.',
      },
    },
  },
  render: () => (
    <div className="flex w-64 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <LabelText className="text-text-tertiary">
          color only — dots fall back to primary
        </LabelText>
        <SliderStepped
          variant={SliderVariant.custom}
          color="#e48844"
          min={0}
          max={6}
          step={1}
          defaultValue={[5]}
        />
      </div>
      <div className="flex flex-col gap-2">
        <LabelText className="text-text-tertiary">
          same track, stepColor=&quot;#ff00b8&quot;
        </LabelText>
        <SliderStepped
          variant={SliderVariant.custom}
          color="#e48844"
          stepColor="#ff00b8"
          min={0}
          max={6}
          step={1}
          defaultValue={[5]}
        />
      </div>
      <div className="flex flex-col gap-2">
        <LabelText className="text-text-tertiary">
          stepColor takes token names too
        </LabelText>
        <SliderStepped
          variant={SliderVariant.custom}
          color="prominent-color-ter"
          stepColor="text"
          min={0}
          max={4}
          step={1}
          defaultValue={[2]}
        />
      </div>
    </div>
  ),
};

export const VariantWithColorOverride: Story = {
  name: 'Variant + color override',
  parameters: {
    docs: {
      description: {
        story:
          '`color` overrides the variant’s HUE and `stepColor` its step dot, ' +
          'each independently. The track opacity still comes from the variant, ' +
          'so an arbitrary provider colour drops into either variant’s ' +
          'geometry without restating it.',
      },
    },
  },
  render: () => (
    <div className="flex w-64 flex-col gap-6">
      <SliderStepped
        variant={SliderVariant.prominent}
        min={0}
        max={4}
        step={1}
        defaultValue={[2]}
      />
      <SliderStepped
        variant={SliderVariant.prominent}
        color="#e48844"
        min={0}
        max={4}
        step={1}
        defaultValue={[2]}
      />
    </div>
  ),
};

export const Colors: Story = {
  name: 'Color prop',
  parameters: {
    docs: {
      description: {
        story:
          '`color` takes a DS token name or any CSS color. The handle renders it solid and the active track renders it at 45%.',
      },
    },
  },
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      {(['primary', 'brand', 'text', 'error-primary'] as const).map((c) => (
        <div key={c} className="flex items-center gap-3">
          <LabelText className="w-16 text-text-tertiary">{c}</LabelText>
          <SliderContinuous color={c} defaultValue={[60]} />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <LabelText className="w-16 text-text-tertiary">#7c5cff</LabelText>
        <SliderContinuous color="#7c5cff" defaultValue={[60]} />
      </div>
      <div className="flex items-center gap-3">
        <LabelText className="w-16 text-text-tertiary">stepped</LabelText>
        <SliderStepped color="#22a06b" min={0} max={4} step={1} defaultValue={[2]} />
      </div>
    </div>
  ),
};

export const Labeled: Story = {
  render: () => (
    <div className="flex w-64 flex-col gap-6">
      <SliderLabeled
        defaultValue={[50]}
        labels={{ start: 'Faster', end: 'Smarter' }}
      />
      <SliderLabeled
        color="prominent"
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
        <SliderContinuous value={value} onValueChange={setValue} />
        <LabelText className="w-8 text-text-tertiary">{value[0]}</LabelText>
      </div>
    );
  },
};

export const ControlledStepped: Story = {
  name: 'Controlled (stepped)',
  parameters: {
    docs: {
      description: {
        story:
          'The handle follows the pointer continuously while dragging, but `onValueChange` only ever reports values on the step — watch the readout change in whole steps while the handle moves smoothly.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState([2]);
    return (
      <div className="flex w-64 items-center gap-3">
        <SliderStepped
          min={0}
          max={4}
          step={1}
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
      <SliderContinuous defaultValue={[50]} disabled />
      <SliderStepped min={0} max={4} step={1} defaultValue={[2]} disabled />
    </div>
  ),
};

export const KeyboardInteraction: Story = {
  name: 'Keyboard interaction',
  parameters: {
    docs: {
      description: {
        story:
          'Focus the handle (Tab) then use Left/Right (or Up/Down) to move by one step; Home/End jump to min/max. The continuous slider gets this from Radix. The stepped slider handles it itself, because Radix is driven at a much finer step there to keep dragging smooth — so a key press must still move exactly one dot.',
      },
    },
  },
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      <SliderContinuous defaultValue={[50]} />
      <SliderStepped min={0} max={4} step={1} defaultValue={[2]} />
    </div>
  ),
};
