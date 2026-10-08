import type { Meta, StoryObj } from '@storybook/react';
import { OverviewIcon, TableIcon } from '../Icons';
import { TabSize } from '../Tabs';
import { LabelText } from '../Text';
import { SegmentedTabItem, SegmentedTabSelect } from './SegmentedTabSelect';
import { SegmentedVariant } from './constants';

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

/** 30px shell-less row (Figma "Micro") — used by the date range split trigger. */
export const Micro: Story = {
  render: () => (
    <SegmentedTabSelect defaultValue="7d" variant={SegmentedVariant.micro}>
      <SegmentedTabItem value="7d">7 Days</SegmentedTabItem>
      <SegmentedTabItem value="30d">30 Days</SegmentedTabItem>
      <SegmentedTabItem value="3m">3 Months</SegmentedTabItem>
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

/**
 * Every named wrapper variant, plus the icon-only shapes. The icon rows are
 * composed with a per-item `size` rather than a wrapper variant — the icon
 * shapes in Figma are the same variants with icon-sized items.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      {(
        [
          [SegmentedVariant.ghost, 'Ghost — 38px items'],
          [SegmentedVariant.ghostSmall, 'Ghost Small — 34px items'],
          [SegmentedVariant.micro, 'Micro — 30px items'],
          [SegmentedVariant.secondary, 'Secondary — 38px items in a shell'],
          [SegmentedVariant.secondarySmall, 'Secondary Small — 34px items'],
          [SegmentedVariant.primary, 'Primary — 38px items in a shell'],
          [SegmentedVariant.primarySmall, 'Primary Small — 34px items'],
        ] as const
      ).map(([variant, label]) => (
        <div key={variant} className="flex flex-col gap-2">
          <LabelText className="text-text-secondary">{label}</LabelText>
          <SegmentedTabSelect defaultValue="all" variant={variant}>
            <SegmentedTabItem value="all">All</SegmentedTabItem>
            <SegmentedTabItem value="active">Active</SegmentedTabItem>
            <SegmentedTabItem value="archived">Archived</SegmentedTabItem>
          </SegmentedTabSelect>
        </div>
      ))}

      {(
        [
          [SegmentedVariant.ghost, TabSize.icon, 'Ghost Icon — 38×38'],
          [SegmentedVariant.ghostSmall, TabSize.iconSm, 'Ghost Icon Small — 34×34'],
          [SegmentedVariant.secondary, TabSize.icon, 'Secondary Icon — 38×38'],
          [
            SegmentedVariant.secondarySmall,
            TabSize.iconSm,
            'Secondary Icon Small — 34×34',
          ],
        ] as const
      ).map(([variant, size, label]) => (
        <div key={label} className="flex flex-col gap-2">
          <LabelText className="text-text-secondary">{label}</LabelText>
          <SegmentedTabSelect defaultValue="list" variant={variant}>
            <SegmentedTabItem value="list" size={size} aria-label="List view">
              <TableIcon />
            </SegmentedTabItem>
            <SegmentedTabItem value="grid" size={size} aria-label="Grid view">
              <OverviewIcon />
            </SegmentedTabItem>
          </SegmentedTabSelect>
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <LabelText className="text-text-secondary">
          Ghost Icon + Text — icon composed into a default item
        </LabelText>
        <SegmentedTabSelect defaultValue="all" variant={SegmentedVariant.ghost}>
          <SegmentedTabItem value="all">
            <TableIcon />
            All
          </SegmentedTabItem>
          <SegmentedTabItem value="active">
            <OverviewIcon />
            Active
          </SegmentedTabItem>
        </SegmentedTabSelect>
      </div>
    </div>
  ),
};
