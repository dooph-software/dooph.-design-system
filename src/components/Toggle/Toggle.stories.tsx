import type { Meta, StoryObj } from '@storybook/react';
import { TwoWayToggle, TwoWayToggleItem, ToggleSize, ToggleVariant } from './Toggle';

const meta = {
  title: 'Buttons & inputs/TwoWayToggle',
  component: TwoWayToggle,
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
} satisfies Meta<typeof TwoWayToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <TwoWayToggle defaultValue="week" variant={ToggleVariant.primary}>
      <TwoWayToggleItem value="week">Week</TwoWayToggleItem>
      <TwoWayToggleItem value="month">Month</TwoWayToggleItem>
    </TwoWayToggle>
  ),
};

export const Secondary: Story = {
  render: () => (
    <TwoWayToggle defaultValue="list" variant={ToggleVariant.secondary}>
      <TwoWayToggleItem value="list">List</TwoWayToggleItem>
      <TwoWayToggleItem value="grid">Grid</TwoWayToggleItem>
    </TwoWayToggle>
  ),
};

export const PrimarySmall: Story = {
  render: () => (
    <TwoWayToggle defaultValue="asc" variant={ToggleVariant.primary} size={ToggleSize.sm}>
      <TwoWayToggleItem value="asc">Asc</TwoWayToggleItem>
      <TwoWayToggleItem value="desc">Desc</TwoWayToggleItem>
    </TwoWayToggle>
  ),
};

export const SecondarySmall: Story = {
  render: () => (
    <TwoWayToggle defaultValue="asc" variant={ToggleVariant.secondary} size={ToggleSize.sm}>
      <TwoWayToggleItem value="asc">Asc</TwoWayToggleItem>
      <TwoWayToggleItem value="desc">Desc</TwoWayToggleItem>
    </TwoWayToggle>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <span className="text-style-label text-text-secondary">Primary</span>
        <TwoWayToggle defaultValue="a" variant={ToggleVariant.primary}>
          <TwoWayToggleItem value="a">Option A</TwoWayToggleItem>
          <TwoWayToggleItem value="b">Option B</TwoWayToggleItem>
        </TwoWayToggle>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-style-label text-text-secondary">Secondary</span>
        <TwoWayToggle defaultValue="a" variant={ToggleVariant.secondary}>
          <TwoWayToggleItem value="a">Option A</TwoWayToggleItem>
          <TwoWayToggleItem value="b">Option B</TwoWayToggleItem>
        </TwoWayToggle>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-style-label text-text-secondary">Primary (sm)</span>
        <TwoWayToggle defaultValue="a" variant={ToggleVariant.primary} size={ToggleSize.sm}>
          <TwoWayToggleItem value="a">A</TwoWayToggleItem>
          <TwoWayToggleItem value="b">B</TwoWayToggleItem>
        </TwoWayToggle>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-style-label text-text-secondary">Secondary (sm)</span>
        <TwoWayToggle defaultValue="a" variant={ToggleVariant.secondary} size={ToggleSize.sm}>
          <TwoWayToggleItem value="a">A</TwoWayToggleItem>
          <TwoWayToggleItem value="b">B</TwoWayToggleItem>
        </TwoWayToggle>
      </div>
    </div>
  ),
};
