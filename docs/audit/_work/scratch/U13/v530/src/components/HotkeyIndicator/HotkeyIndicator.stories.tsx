import type { Meta, StoryObj } from '@storybook/react';
import { HotkeyIndicator } from './HotkeyIndicator';

const meta = {
  title: 'Bits & Pieces/HotkeyIndicator',
  component: HotkeyIndicator,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    pressed: { control: 'boolean' },
  },
} satisfies Meta<typeof HotkeyIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = { args: { keys: ['⌘'] } };
export const Multiple: Story = { args: { keys: ['⌘', 'K'] } };
export const Pressed: Story = { args: { keys: ['Esc'], pressed: true } };
export const LongCombo: Story = { args: { keys: ['⌘', '⇧', 'P'] } };

export const AllStates: Story = {
  args: { keys: [] },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <span className="text-style-label text-ghost-fg w-20">Single</span>
        <HotkeyIndicator keys={['⌘']} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-style-label text-ghost-fg w-20">Multiple</span>
        <HotkeyIndicator keys={['⌘', 'K']} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-style-label text-ghost-fg w-20">Pressed</span>
        <HotkeyIndicator keys={['Esc']} pressed />
      </div>
    </div>
  ),
};
