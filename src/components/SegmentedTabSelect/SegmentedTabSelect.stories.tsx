import type { Meta, StoryObj } from '@storybook/react-vite';
import { GraphIcon, InvoiceIcon, TableIcon } from '../Icons';
import { SegmentedTabItem, SegmentedTabSelect } from './SegmentedTabSelect';
import { SegmentedSize, SegmentedVariant } from './constants';
import { TabSize, TabVariant } from '../Tabs/constants';

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
    size: {
      control: 'select',
      options: Object.values(SegmentedSize),
    },
  },
} satisfies Meta<typeof SegmentedTabSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const variants = [SegmentedVariant.primary, SegmentedVariant.ghost] as const;

/** Figma Tab Select (827:2784) — text sizes. */
export const TextSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-lg">
      {variants.map((variant) =>
        [SegmentedSize.container, SegmentedSize.standard].map((size) => (
          <SegmentedTabSelect key={`${variant}-${size}`} defaultValue="funding" variant={variant} size={size} data-testid={`${variant}-${size}`}>
            <SegmentedTabItem value="funding">Funding</SegmentedTabItem>
            <SegmentedTabItem value="pnl">Profit &amp; Loss</SegmentedTabItem>
            <SegmentedTabItem value="tx">Transactions</SegmentedTabItem>
          </SegmentedTabSelect>
        )),
      )}
    </div>
  ),
};

/** Icon sizes — containerIcon uses 28px micro icon items. */
export const IconOnlySizes: Story = {
  render: () => (
    <div className="flex flex-col gap-lg">
      {variants.map((variant) =>
        [SegmentedSize.containerIcon, SegmentedSize.icon].map((size) => (
          <SegmentedTabSelect key={`${variant}-${size}`} defaultValue="table" variant={variant} size={size} data-testid={`${variant}-${size}`}>
            <SegmentedTabItem value="table" aria-label="Table"><TableIcon /></SegmentedTabItem>
            <SegmentedTabItem value="graph" aria-label="Graph"><GraphIcon /></SegmentedTabItem>
            <SegmentedTabItem value="invoice" aria-label="Invoices"><InvoiceIcon /></SegmentedTabItem>
          </SegmentedTabSelect>
        )),
      )}
    </div>
  ),
};

/** Items contradict the inherited variant and size. */
export const ItemOverrides: Story = {
  render: () => (
    <SegmentedTabSelect
      defaultValue="funding"
      variant={SegmentedVariant.primary}
      size={SegmentedSize.standard}
    >
      <SegmentedTabItem value="funding">Funding</SegmentedTabItem>
      <SegmentedTabItem value="all" variant={TabVariant.unselected}>
        All
      </SegmentedTabItem>
      <SegmentedTabItem value="tx" size={TabSize.sm}>
        Transactions
      </SegmentedTabItem>
    </SegmentedTabSelect>
  ),
};
