import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import { TabSize, TabVariant } from './constants';

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
        <TabsTrigger value="list" variant={TabVariant.ghost} size={TabSize.icon}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </TabsTrigger>
        <TabsTrigger value="grid" variant={TabVariant.ghost} size={TabSize.icon}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
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
        <span className="text-style-label text-text-secondary">Ghost</span>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a" variant={TabVariant.ghost}>First</TabsTrigger>
            <TabsTrigger value="b" variant={TabVariant.ghost}>Second</TabsTrigger>
            <TabsTrigger value="c" variant={TabVariant.ghost}>Third</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-style-label text-text-secondary">Primary</span>
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
