import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import { TabSize, TabVariant } from './constants';
import { TableIcon, GraphIcon, InvoiceIcon } from '../Icons';
import { LabelText } from '../Text';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ghost: Story = {
  render: () => (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one" variant={TabVariant.ghost}>First tab</TabsTrigger>
        <TabsTrigger value="two" variant={TabVariant.ghost}>Second tab</TabsTrigger>
        <TabsTrigger value="three" variant={TabVariant.ghost}>Third tab</TabsTrigger>
      </TabsList>
      <TabsContent value="one" className="mt-4 text-style-body text-text">Content for first tab</TabsContent>
      <TabsContent value="two" className="mt-4 text-style-body text-text">Content for second tab</TabsContent>
      <TabsContent value="three" className="mt-4 text-style-body text-text">Content for third tab</TabsContent>
    </Tabs>
  ),
};

export const Primary: Story = {
  render: () => (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one" variant={TabVariant.primary}>First tab</TabsTrigger>
        <TabsTrigger value="two" variant={TabVariant.primary}>Second tab</TabsTrigger>
        <TabsTrigger value="three" variant={TabVariant.primary}>Third tab</TabsTrigger>
      </TabsList>
      <TabsContent value="one" className="mt-4 text-style-body text-text">Content for first tab</TabsContent>
      <TabsContent value="two" className="mt-4 text-style-body text-text">Content for second tab</TabsContent>
      <TabsContent value="three" className="mt-4 text-style-body text-text">Content for third tab</TabsContent>
    </Tabs>
  ),
};

export const IconTabs: Story = {
  render: () => (
    <Tabs defaultValue="grid">
      <TabsList>
        <TabsTrigger value="list" variant={TabVariant.ghost} size={TabSize.icon} aria-label="List">
          <TableIcon />
        </TabsTrigger>
        <TabsTrigger value="grid" variant={TabVariant.ghost} size={TabSize.icon} aria-label="Grid">
          <GraphIcon />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">Active</TabsTrigger>
        <TabsTrigger value="two">Normal</TabsTrigger>
        <TabsTrigger value="three" disabled>Disabled</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <LabelText className="text-text-secondary">Ghost</LabelText>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a" variant={TabVariant.ghost}>First</TabsTrigger>
            <TabsTrigger value="b" variant={TabVariant.ghost}>Second</TabsTrigger>
            <TabsTrigger value="c" variant={TabVariant.ghost}>Third</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-col gap-2">
        <LabelText className="text-text-secondary">Primary</LabelText>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a" variant={TabVariant.primary}>First</TabsTrigger>
            <TabsTrigger value="b" variant={TabVariant.primary}>Second</TabsTrigger>
            <TabsTrigger value="c" variant={TabVariant.primary}>Third</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  ),
};

/** Figma Toggle Option (826:1723) — every size × variant, one selected. */
export const ToggleOptionSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-lg">
      {([TabVariant.primary, TabVariant.ghost] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-rg">
          {([TabSize.standard, TabSize.sm, TabSize.micro] as const).map((size) => (
            <Tabs key={size} defaultValue="grid">
              <TabsList>
                <TabsTrigger value="grid" variant={variant} size={size} data-testid={`${variant}-${size}`}>
                  <TableIcon />Grid
                </TabsTrigger>
                <TabsTrigger value="list" variant={variant} size={size}>List</TabsTrigger>
                <TabsTrigger value="off" variant={variant} size={size} disabled>Off</TabsTrigger>
              </TabsList>
            </Tabs>
          ))}
          {([TabSize.icon, TabSize.iconSm, TabSize.iconMicro] as const).map((size) => (
            <Tabs key={size} defaultValue="a">
              <TabsList>
                <TabsTrigger value="a" variant={variant} size={size} aria-label="Table" data-testid={`${variant}-${size}`}><TableIcon /></TabsTrigger>
                <TabsTrigger value="b" variant={variant} size={size} aria-label="Graph"><GraphIcon /></TabsTrigger>
                <TabsTrigger value="c" variant={variant} size={size} aria-label="Invoice"><InvoiceIcon /></TabsTrigger>
              </TabsList>
            </Tabs>
          ))}
        </div>
      ))}
    </div>
  ),
};

/** Contradicts the variant/size defaults: an `unselected` trigger stays unchosen while active; `fill` follows the parent's 48px height. */
export const UnselectedAndFill: Story = {
  render: () => (
    <div className="flex h-12 items-stretch">
      <Tabs defaultValue="all" className="flex">
        <TabsList className="h-full">
          <TabsTrigger value="all" variant={TabVariant.unselected} size={TabSize.fill}>
            All
          </TabsTrigger>
          <TabsTrigger value="mine" variant={TabVariant.primary} size={TabSize.fill}>
            Mine
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  ),
};
