import type { Meta, StoryObj } from '@storybook/react';
import { ShapeButton, ShapeButtons } from './ShapeButton';

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M8 2l1.5 3.5L13 6l-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5L8 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const meta = {
  title: 'Buttons & inputs/ShapeButton',
  component: ShapeButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    shape: {
      control: 'select',
      options: Object.values(ShapeButtons),
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof ShapeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Clover: Story = {
  args: { shape: ShapeButtons.clover, children: <StarIcon /> },
};

export const Cookie: Story = {
  args: { shape: ShapeButtons.cookie, children: <StarIcon /> },
};

export const Pentagon: Story = {
  args: { shape: ShapeButtons.pentagon, children: <StarIcon /> },
};

export const Gem: Story = {
  args: { shape: ShapeButtons.gem, children: <StarIcon /> },
};

export const Disabled: Story = {
  args: { shape: ShapeButtons.clover, children: <StarIcon />, disabled: true },
};

export const AllShapes: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      {Object.entries(ShapeButtons).map(([label, shape]) => (
        <div key={shape} className="flex flex-col items-center gap-2">
          <ShapeButton shape={shape}>
            <StarIcon />
          </ShapeButton>
          <span className="text-style-label text-text-secondary">{label}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <ShapeButton shape={ShapeButtons.gem}><StarIcon /></ShapeButton>
        <span className="text-style-label text-text-secondary">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <ShapeButton shape={ShapeButtons.gem} disabled><StarIcon /></ShapeButton>
        <span className="text-style-label text-text-secondary">Disabled</span>
      </div>
    </div>
  ),
};
