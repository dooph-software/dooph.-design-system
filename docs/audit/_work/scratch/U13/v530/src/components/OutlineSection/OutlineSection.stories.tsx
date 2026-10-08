import type { Meta, StoryObj } from '@storybook/react';
import { OutlineSection } from './OutlineSection';
import { Button } from '../Button/Button';
import { ButtonSize, ButtonVariant } from '../Button/constants';
import { CheckIcon, PlusIcon } from '../Icons';

const meta = {
  title: 'Bits & Pieces/OutlineSection',
  component: OutlineSection,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof OutlineSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <OutlineSection>
      <Button variant={ButtonVariant.secondary}>Action</Button>
    </OutlineSection>
  ),
};

export const WithMultipleChildren: Story = {
  render: () => (
    <OutlineSection>
      <div className="flex items-center gap-2">
        <Button
          variant={ButtonVariant.secondary}
          size={ButtonSize.icon}
          aria-label="Add"
        >
          <PlusIcon />
        </Button>
        <Button variant={ButtonVariant.secondary}>Label</Button>
        <Button
          variant={ButtonVariant.secondary}
          size={ButtonSize.icon}
          aria-label="Confirm"
        >
          <CheckIcon />
        </Button>
      </div>
    </OutlineSection>
  ),
};
