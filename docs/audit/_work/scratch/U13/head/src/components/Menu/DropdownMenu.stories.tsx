import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuMultiSelectItem,
  DropdownMenuLabel,
  DropdownMenuPlainItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioSelectItem,
  DropdownMenuSection,
  DropdownMenuSegment,
  DropdownMenuSeparator,
} from './DropdownMenu';
import { DropdownMenuSearch } from './DropdownMenuSearch';
import {
  DropdownMenuItemVariant,
  DropdownMenuSegmentVariant,
  DropdownMenuSelectType,
} from './constants';
import {
  DropdownTrigger,
  TypeableDropdownTrigger,
} from '../DropdownTrigger/DropdownTrigger';
import { Button } from '../Button/Button';
import { ButtonVariant } from '../Button/constants';
import { BodyText } from '../Text';
import { SettingsGearIcon, LogOutIcon, ArrowRightIcon } from '../Icons';
import { ToggleSwitch, ToggleSwitchItem } from '../Toggle/Toggle';
import { ToggleSize, ToggleVariant } from '../Toggle/constants';

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

/** Figma Menu Segment (832:1907) + Dropdown Menu (832:1960). */
export const Segments: Story = {
  render: () => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Segments</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuItem>Cut</DropdownMenuItem>
          <DropdownMenuItem>Copy</DropdownMenuItem>
        </DropdownMenuSection>
        <DropdownMenuSegment data-testid="seg-divider" />
        <DropdownMenuSection>
          <DropdownMenuItem>Select all</DropdownMenuItem>
        </DropdownMenuSection>
        <DropdownMenuSegment variant={DropdownMenuSegmentVariant.labeled} data-testid="seg-labeled">
          Filter by
        </DropdownMenuSegment>
        <DropdownMenuSection>
          <DropdownMenuItem>Owner</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

const SHOES = ['Sneakers', 'Boots', 'Sandals', 'Loafers'] as const;

/** Figma Checkbox Menu Item (826:1554) under selectType=multi — stays open. */
export const MultiSelect: Story = {
  render: function MultiSelectStory() {
    const [picked, setPicked] = useState<string[]>(['Sneakers']);
    const toggle = (name: string, on: boolean) =>
      setPicked((prev) => (on ? [...prev, name] : prev.filter((p) => p !== name)));
    return (
      <DropdownMenu selectType={DropdownMenuSelectType.multi}>
        <DropdownMenuTrigger asChild>
          <DropdownTrigger>{picked.length} Selected</DropdownTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSection>
            {SHOES.map((name) => (
              <DropdownMenuMultiSelectItem
                key={name}
                checked={picked.includes(name)}
                onCheckedChange={(on) => toggle(name, on === true)}
                data-testid={`ms-${name}`}
              >
                {name}
              </DropdownMenuMultiSelectItem>
            ))}
            <DropdownMenuMultiSelectItem checked disabled data-testid="ms-disabled">Discontinued</DropdownMenuMultiSelectItem>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

/** Same items under the default selectType=single — each click closes. */
export const SingleModeCheckboxes: Story = {
  render: function SingleModeStory() {
    const [on, setOn] = useState(true);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <DropdownTrigger>View</DropdownTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSection>
            <DropdownMenuMultiSelectItem checked={on} onCheckedChange={(v) => setOn(v === true)}>
              Show sidebar
            </DropdownMenuMultiSelectItem>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
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
 * Sizing model: items hold the 160px floor; sections and the panel hug the
 * widest item, and every section/segment stretches to it. `width` on a section
 * is an explicit override.
 */
export const HugsWidestItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Hugs</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent matchTriggerWidth={false} data-testid="hug-panel">
        <DropdownMenuSection>
          <DropdownMenuItem data-testid="hug-short">Rename</DropdownMenuItem>
          <DropdownMenuItem>Duplicate this very long item name</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const SectionWidthOverride: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={ButtonVariant.secondary}>Width 324</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent matchTriggerWidth={false}>
        <DropdownMenuSection width={324} data-testid="wide-section">
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Multi-select with a typeable trigger: filter by typing, toggle without closing. */
export const TypeableMultiSelect: Story = {
  render: function TypeableMultiStory() {
    const [query, setQuery] = useState('');
    const [picked, setPicked] = useState<string[]>([]);
    const visible = SHOES.filter((s) => s.toLowerCase().includes(query.toLowerCase()));
    return (
      <DropdownMenu selectType={DropdownMenuSelectType.multi}>
        <DropdownMenuTrigger asChild>
          <TypeableDropdownTrigger
            placeholder="Shoes..."
            displayValue={picked.length ? `${picked.length} Selected` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="tm-trigger"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent focusOnOpen={false}>
          <DropdownMenuSection>
            {visible.map((name) => (
              <DropdownMenuMultiSelectItem
                key={name}
                checked={picked.includes(name)}
                onCheckedChange={(on) =>
                  setPicked((prev) => (on === true ? [...prev, name] : prev.filter((p) => p !== name)))
                }
              >
                {name}
              </DropdownMenuMultiSelectItem>
            ))}
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

/** Fix-round-1 verification: a disabled typeable trigger must never open the menu. */
export const TypeableDisabledInMenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TypeableDropdownTrigger disabled placeholder="Users..." data-testid="td-trigger" />
      </DropdownMenuTrigger>
      <DropdownMenuContent focusOnOpen={false}>
        <DropdownMenuSection>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** selectType travels to any trigger as a plain data-select-type prop (Radix Slot merge). */
export const SelectTypeOnTrigger: Story = {
  render: () => (
    <DropdownMenu selectType={DropdownMenuSelectType.multi}>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger data-testid="st-trigger">Multi</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuItem>Item</DropdownMenuItem>
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

/** Figma Menu Item (825:1814) — the eight variants, composed. */
export const ItemVariants: Story = {
  render: () => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Items</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuItem data-testid="item-action">Manage</DropdownMenuItem>
          <DropdownMenuItem><SettingsGearIcon />Settings</DropdownMenuItem>
          <DropdownMenuItem><span className="flex-1">Settings</span><SettingsGearIcon /></DropdownMenuItem>
          <DropdownMenuItem variant={DropdownMenuItemVariant.danger} data-testid="item-danger">Delete</DropdownMenuItem>
          <DropdownMenuItem variant={DropdownMenuItemVariant.danger}><LogOutIcon />Logout</DropdownMenuItem>
          <DropdownMenuItem variant={DropdownMenuItemVariant.danger}><span className="flex-1">Logout</span><LogOutIcon /></DropdownMenuItem>
          <DropdownMenuItem>
            <div className="flex flex-1 items-center justify-between">
              <span className="flex items-center gap-sm"><SettingsGearIcon />Edit</span>
              <ArrowRightIcon />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem disabled data-testid="item-disabled">Disabled</DropdownMenuItem>
          <DropdownMenuPlainItem data-testid="item-plain">
            <span className="flex-1">Buildings</span>
            <ToggleSwitch defaultValue="3d" variant={ToggleVariant.ghost} size={ToggleSize.sm}>
              <ToggleSwitchItem value="3d">3D</ToggleSwitchItem>
              <ToggleSwitchItem value="2d">2D</ToggleSwitchItem>
            </ToggleSwitch>
          </DropdownMenuPlainItem>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** Figma Single Select Menu Item (827:3758). */
export const RadioSelect: Story = {
  render: function RadioSelectStory() {
    const [role, setRole] = useState('admin');
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <DropdownTrigger>{role}</DropdownTrigger>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSection>
            <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
              <DropdownMenuRadioSelectItem value="admin" data-testid="radio-admin">Admin</DropdownMenuRadioSelectItem>
              <DropdownMenuRadioSelectItem value="member">Member</DropdownMenuRadioSelectItem>
              <DropdownMenuRadioSelectItem value="guest" disabled>Guest</DropdownMenuRadioSelectItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSection>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

/** A disabled item that is also the checked value keeps its selected fill (bg-ghost-active) in every pointer state. */
export const RadioSelectDisabledChecked: Story = {
  render: () => (
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>guest</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSection>
          <DropdownMenuRadioGroup value="guest">
            <DropdownMenuRadioSelectItem value="admin">Admin</DropdownMenuRadioSelectItem>
            <DropdownMenuRadioSelectItem value="member">Member</DropdownMenuRadioSelectItem>
            <DropdownMenuRadioSelectItem value="guest" disabled data-testid="radio-guest-disabled-checked">
              Guest
            </DropdownMenuRadioSelectItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSection>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const ComplexWithoutSearch: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Recent chats</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent matchTriggerWidth={false}>
        <DropdownMenuSection width={324}>
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger>Search chats</DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent matchTriggerWidth={false} focusOnOpen={false}>
        <DropdownMenuSearch />
        <DropdownMenuSeparator />
        <DropdownMenuSection width={324}>
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
