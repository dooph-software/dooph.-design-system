import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedTabItem, SegmentedTabSelect, SegmentedVariant } from './SegmentedTabSelect';

const meta = {
  title: 'Navigation/SegmentedTabSelect',
  component: SegmentedTabSelect,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: Object.values(SegmentedVariant),
    },
  },
} satisfies Meta<typeof SegmentedTabSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {
  render: () => (
    <SegmentedTabSelect defaultValue="all" variant={SegmentedVariant.ghost}>
      <SegmentedTabItem value="all">All</SegmentedTabItem>
      <SegmentedTabItem value="active">Active</SegmentedTabItem>
      <SegmentedTabItem value="archived">Archived</SegmentedTabItem>
    </SegmentedTabSelect>
  ),
};

export const GhostSmall: Story = {
  render: () => (
    <SegmentedTabSelect defaultValue="all" variant={SegmentedVariant.ghostSmall}>
      <SegmentedTabItem value="all">All</SegmentedTabItem>
      <SegmentedTabItem value="active">Active</SegmentedTabItem>
      <SegmentedTabItem value="archived">Archived</SegmentedTabItem>
    </SegmentedTabSelect>
  ),
};

export const Secondary: Story = {
  render: () => (
    <SegmentedTabSelect defaultValue="all" variant={SegmentedVariant.secondary}>
      <SegmentedTabItem value="all">All</SegmentedTabItem>
      <SegmentedTabItem value="active">Active</SegmentedTabItem>
      <SegmentedTabItem value="archived">Archived</SegmentedTabItem>
    </SegmentedTabSelect>
  ),
};

export const SecondarySmall: Story = {
  render: () => (
    <SegmentedTabSelect defaultValue="all" variant={SegmentedVariant.secondarySmall}>
      <SegmentedTabItem value="all">All</SegmentedTabItem>
      <SegmentedTabItem value="active">Active</SegmentedTabItem>
      <SegmentedTabItem value="archived">Archived</SegmentedTabItem>
    </SegmentedTabSelect>
  ),
};

export const Primary: Story = {
  render: () => (
    <SegmentedTabSelect defaultValue="all" variant={SegmentedVariant.primary}>
      <SegmentedTabItem value="all">All</SegmentedTabItem>
      <SegmentedTabItem value="active">Active</SegmentedTabItem>
      <SegmentedTabItem value="archived">Archived</SegmentedTabItem>
    </SegmentedTabSelect>
  ),
};

export const PrimarySmall: Story = {
  render: () => (
    <SegmentedTabSelect defaultValue="all" variant={SegmentedVariant.primarySmall}>
      <SegmentedTabItem value="all">All</SegmentedTabItem>
      <SegmentedTabItem value="active">Active</SegmentedTabItem>
      <SegmentedTabItem value="archived">Archived</SegmentedTabItem>
    </SegmentedTabSelect>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {(
        [
          [SegmentedVariant.ghost, 'Ghost'],
          [SegmentedVariant.ghostSmall, 'Ghost (legacy small)'],
          [SegmentedVariant.secondary, 'Secondary'],
          [SegmentedVariant.secondarySmall, 'Secondary (legacy small)'],
          [SegmentedVariant.primary, 'Primary'],
          [SegmentedVariant.primarySmall, 'Primary (legacy small)'],
        ] as const
      ).map(([variant, label]) => (
        <div key={variant} className="flex flex-col gap-2">
          <span className="text-style-label text-text-secondary">{label}</span>
          <SegmentedTabSelect defaultValue="all" variant={variant}>
            <SegmentedTabItem value="all">All</SegmentedTabItem>
            <SegmentedTabItem value="active">Active</SegmentedTabItem>
            <SegmentedTabItem value="archived">Archived</SegmentedTabItem>
          </SegmentedTabSelect>
        </div>
      ))}
    </div>
  ),
};
