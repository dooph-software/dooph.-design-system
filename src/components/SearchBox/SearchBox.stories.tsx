import type { Meta, StoryObj } from '@storybook/react';
import { SearchBox } from './SearchBox';

const meta = {
  title: 'Buttons & inputs/SearchBox',
  component: SearchBox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    showShortcut: { control: 'boolean' },
  },
} satisfies Meta<typeof SearchBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: 'Search...' },
};

export const WithShortcut: Story = {
  args: { placeholder: 'Search...', shortcut: ['⌘', 'K'] },
};

export const WithCtrlShortcut: Story = {
  args: { placeholder: 'Find anything', shortcut: ['Ctrl', 'K'] },
};

export const Disabled: Story = {
  args: { placeholder: 'Search...', shortcut: ['⌘', 'K'], disabled: true },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <SearchBox placeholder="Default" />
      <SearchBox placeholder="With shortcut" shortcut={['⌘', 'K']} />
      <SearchBox placeholder="Disabled" shortcut={['⌘', 'K']} disabled />
    </div>
  ),
};
