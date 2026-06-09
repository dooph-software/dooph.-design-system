import type { Meta, StoryObj } from '@storybook/react';
import { OutlineSection } from './OutlineSection';
import { Button } from '../Button/Button';

const meta = {
  title: 'Primitives/OutlineSection',
  component: OutlineSection,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof OutlineSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <OutlineSection>
      <Button variant="secondary">Action</Button>
    </OutlineSection>
  ),
};

export const WithMultipleChildren: Story = {
  render: () => (
    <OutlineSection>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Button>
        <Button variant="secondary">Label</Button>
        <Button variant="secondary" size="icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </Button>
      </div>
    </OutlineSection>
  ),
};
