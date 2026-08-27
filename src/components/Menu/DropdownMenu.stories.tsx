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
import { DropdownMenuSearch } from './DropdownMenuSearch';
import { DropdownMenuItemVariant, DropdownMenuVariant } from './constants';
import {
  DropdownTrigger,
  TypeableDropdownTrigger,
} from '../DropdownTrigger/DropdownTrigger';
import { Button } from '../Button/Button';
import { ButtonVariant } from '../Button/constants';
import { BodyText } from '../Text';

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

/**
 * Width variants (Figma `dropdownWidths`). Set `variant` once on the
 * `DropdownMenu` root — every `DropdownMenuContent` beneath it reads the value
 * from context and adopts the matching min-width floor, so items inherit the
 * width with no per-item props.
 *
 * The floor applies in both width modes: with `matchTriggerWidth` (default) it
 * is the lower bound of `max(trigger-width, floor)`; with
 * `matchTriggerWidth={false}` it is the width outright.
 */
export const WidthVariants: Story = {
  render: () => (
    <div className="flex flex-row items-start gap-xl">
      {(
        [
          [DropdownMenuVariant.action, 'Action (144px)'],
          [DropdownMenuVariant.standard, 'Standard (160px)'],
          [DropdownMenuVariant.complex, 'Complex (324px)'],
        ] as const
      ).map(([variant, label]) => (
        <DropdownMenu key={variant} variant={variant}>
          <DropdownMenuTrigger asChild>
            <Button variant={ButtonVariant.secondary}>{label}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent matchTriggerWidth={false}>
            <DropdownMenuSection>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuSection>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  ),
};

/** A single panel can opt out of the root's variant via its own `variant` prop. */
export const WidthVariantPerPanelOverride: Story = {
  render: () => (
    <DropdownMenu variant={DropdownMenuVariant.action}>
      <DropdownMenuTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Root=action, panel=complex</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        matchTriggerWidth={false}
        variant={DropdownMenuVariant.complex}
      >
        <DropdownMenuSection>
          <DropdownMenuItem>This panel overrides to 324px</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const DangerItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Account</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem variant={DropdownMenuItemVariant.danger}>
            Delete account
          </DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ComplexWithoutSearch: Story = {
  render: () => (
    <DropdownMenu variant={DropdownMenuVariant.complex}>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Recent chats</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent matchTriggerWidth={false}>
        <DropdownMenuSection>
          <DropdownMenuLabel>Recent Chats</DropdownMenuLabel>
          <DropdownMenuItem>
            <div className="flex flex-col gap-[2px]">
              <BodyText>Mark up drawings with tolerances</BodyText>
              <BodyText className="text-ghost-fg">sakai.dwg</BodyText>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex flex-col gap-[2px]">
              <BodyText>Architectural measurements</BodyText>
              <BodyText className="text-ghost-fg">dreter-street-mock.dwg</BodyText>
            </div>
          </DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ComplexWithSearch: Story = {
  render: () => (
    <DropdownMenu variant={DropdownMenuVariant.complex}>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Search chats</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent matchTriggerWidth={false} focusOnOpen={false}>
        <DropdownMenuSearch />
        <DropdownMenuSeparator />
        <DropdownMenuSection>
          <DropdownMenuLabel>Recent Chats</DropdownMenuLabel>
          <DropdownMenuItem>
            <div className="flex flex-col gap-[2px]">
              <BodyText>Mark up drawings with tolerances</BodyText>
              <BodyText className="text-ghost-fg">sakai.dwg</BodyText>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex flex-col gap-[2px]">
              <BodyText>Architectural measurements</BodyText>
              <BodyText className="text-ghost-fg">dreter-street-mock.dwg</BodyText>
            </div>
          </DropdownMenuItem>
          <DropdownMenuLabel>Yesterday</DropdownMenuLabel>
          <DropdownMenuItem>
            <div className="flex flex-col gap-[2px]">
              <BodyText>Deburring requirement</BodyText>
              <BodyText className="text-ghost-fg">bracket-left.dwg</BodyText>
            </div>
          </DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
