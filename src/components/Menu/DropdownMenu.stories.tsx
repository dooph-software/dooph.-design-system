import type { Meta, StoryObj } from '@storybook/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSection,
} from './DropdownMenu';
import {
  DropdownTrigger,
  TypeableDropdownTrigger,
} from '../DropdownTrigger/DropdownTrigger';
import { Button } from '../Button/Button';
import { ButtonVariant } from '../Button/constants';

const meta = {
  title: 'Menus/DropdownMenu',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Standard: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Open menu</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuItem>New file</DropdownMenuItem>
          <DropdownMenuItem>Open…</DropdownMenuItem>
          <DropdownMenuItem>Save</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithTypeableTrigger: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TypeableDropdownTrigger placeholder="Search commands…" />
      </DropdownMenuTrigger>
      <DropdownMenuContent focusOnOpen={false}>
        <DropdownMenuSection>
          <DropdownMenuItem>New file</DropdownMenuItem>
          <DropdownMenuItem>Open recent</DropdownMenuItem>
          <DropdownMenuItem>Search project</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Typeable trigger beside other controls — mirrors dense toolbar layouts in consuming apps. */
export const TypeableInToolbar: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button variant={ButtonVariant.secondary}>Save</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <TypeableDropdownTrigger placeholder="Filter…" className="min-w-48" />
        </DropdownMenuTrigger>
        <DropdownMenuContent focusOnOpen={false}>
          <DropdownMenuSection>
            <DropdownMenuItem>All items</DropdownMenuItem>
            <DropdownMenuItem>Active only</DropdownMenuItem>
            <DropdownMenuItem>Archived</DropdownMenuItem>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};

export const Segmented: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Segmented</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuItem>Cut</DropdownMenuItem>
          <DropdownMenuItem>Copy</DropdownMenuItem>
          <DropdownMenuItem>Paste</DropdownMenuItem>
        </DropdownMenuSection>
        <DropdownMenuSeparator />
        <DropdownMenuSection>
          <DropdownMenuItem>Select all</DropdownMenuItem>
          <DropdownMenuItem>Deselect</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const SegmentedWithLabels: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>With labels</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuItem>New file</DropdownMenuItem>
          <DropdownMenuItem>Open…</DropdownMenuItem>
        </DropdownMenuSection>
        <DropdownMenuSeparator />
        <DropdownMenuSection>
          <DropdownMenuLabel>Edit</DropdownMenuLabel>
          <DropdownMenuItem>Cut</DropdownMenuItem>
          <DropdownMenuItem>Copy</DropdownMenuItem>
          <DropdownMenuItem>Paste</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Checkable items</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuCheckboxItem checked>Show sidebar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Show toolbar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked>Show statusbar</DropdownMenuCheckboxItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>With disabled</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuItem>Enabled item</DropdownMenuItem>
          <DropdownMenuItem disabled>Disabled item</DropdownMenuItem>
          <DropdownMenuItem>Another enabled</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
