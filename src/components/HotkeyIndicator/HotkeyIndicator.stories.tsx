import type { Meta, StoryObj } from '@storybook/react-vite';
import { HotkeyIndicator } from './HotkeyIndicator';
import { HotkeyIndicatorVariant } from './constants';
import { LabelText } from '../Text';

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
export const Menu: Story = { args: { keys: ['Esc'], variant: HotkeyIndicatorVariant.menu } };

export const AllStates: Story = {
  args: { keys: [] },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <LabelText className="text-ghost-fg w-20">Single</LabelText>
        <HotkeyIndicator keys={['⌘']} />
      </div>
      <div className="flex items-center gap-2">
        <LabelText className="text-ghost-fg w-20">Multiple</LabelText>
        <HotkeyIndicator keys={['⌘', 'K']} />
      </div>
      <div className="flex items-center gap-2">
        <LabelText className="text-ghost-fg w-20">Pressed</LabelText>
        <HotkeyIndicator keys={['Esc']} pressed />
      </div>
    </div>
  ),
};
